import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, CallStatus } from '../entities/appointment.entity';
import { StartCallDto, UpdateCallStatusDto } from '../dto/appointment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WebRTCService {
  private readonly logger = new Logger(WebRTCService.name);
  private activeRooms = new Map<string, any>();

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  /**
   * Initialize a video call for an appointment
   */
  async startCall(appointmentId: string, startCallDto: StartCallDto) {
    this.logger.log(`Starting call for appointment ${appointmentId}`);

    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
      relations: ['patient', 'patient.user', 'provider', 'provider.user'],
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    // Generate unique room ID and peer credentials
    const roomId = uuidv4();
    const peerCredentials = this.generatePeerCredentials(appointmentId);

    // Update appointment with call details
    appointment.roomId = roomId;
    appointment.callStatus = CallStatus.CONNECTING;
    appointment.callStartedAt = new Date();

    await this.appointmentRepository.save(appointment);

    // Initialize room in memory
    this.activeRooms.set(roomId, {
      appointmentId,
      participants: [],
      startTime: new Date(),
      status: CallStatus.CONNECTING,
      peerCredentials,
    });

    this.logger.log(`Call initiated for room ${roomId}`);

    return {
      roomId,
      callStatus: CallStatus.CONNECTING,
      appointmentId,
      peerCredentials,
      participants: {
        patient: {
          id: appointment.patient.userId,
          name: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
        },
        provider: {
          id: appointment.provider.userId,
          name: `${appointment.provider.user.firstName} ${appointment.provider.user.lastName}`,
        },
      },
    };
  }

  /**
   * Join a video call room
   */
  async joinCall(roomId: string, userId: string) {
    this.logger.log(`User ${userId} joining room ${roomId}`);

    const room = this.activeRooms.get(roomId);
    if (!room) {
      throw new BadRequestException('Room not found or call ended');
    }

    // Add participant to room
    const existingParticipant = room.participants.find(p => p.userId === userId);
    if (!existingParticipant) {
      room.participants.push({
        userId,
        joinedAt: new Date(),
        isConnected: true,
      });
    } else {
      existingParticipant.isConnected = true;
      existingParticipant.rejoinedAt = new Date();
    }

    // Update call status to active if both participants joined
    if (room.participants.length >= 2 && room.status === CallStatus.CONNECTING) {
      room.status = CallStatus.ACTIVE;
      
      // Update appointment
      const appointment = await this.appointmentRepository.findOne({
        where: { appointmentId: room.appointmentId },
      });
      
      if (appointment) {
        appointment.callStatus = CallStatus.ACTIVE;
        await this.appointmentRepository.save(appointment);
      }
    }

    this.activeRooms.set(roomId, room);

    return {
      roomId,
      participants: room.participants,
      callStatus: room.status,
    };
  }

  /**
   * Leave a video call room
   */
  async leaveCall(roomId: string, userId: string) {
    this.logger.log(`User ${userId} leaving room ${roomId}`);

    const room = this.activeRooms.get(roomId);
    if (!room) {
      return { success: true, message: 'Room not found' };
    }

    // Mark participant as disconnected
    const participant = room.participants.find(p => p.userId === userId);
    if (participant) {
      participant.isConnected = false;
      participant.leftAt = new Date();
    }

    this.activeRooms.set(roomId, room);

    return {
      roomId,
      participants: room.participants,
      callStatus: room.status,
    };
  }

  /**
   * End a video call
   */
  async endCall(appointmentId: string, updateCallStatusDto: UpdateCallStatusDto) {
    this.logger.log(`Ending call for appointment ${appointmentId}`);

    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    // Update appointment
    appointment.callStatus = CallStatus.ENDED;
    appointment.callEndedAt = new Date();

    await this.appointmentRepository.save(appointment);

    // Remove room from active rooms
    if (appointment.roomId) {
      const room = this.activeRooms.get(appointment.roomId);
      if (room) {
        room.status = CallStatus.ENDED;
        room.endTime = new Date();
        
        // Keep room data for a short time for cleanup
        setTimeout(() => {
          this.activeRooms.delete(appointment.roomId);
        }, 60000); // Remove after 1 minute
      }
    }

    return {
      appointmentId,
      callStatus: CallStatus.ENDED,
      callDuration: appointment.callEndedAt.getTime() - appointment.callStartedAt?.getTime(),
    };
  }

  /**
   * Get call status and participants
   */
  async getCallStatus(roomId: string) {
    const room = this.activeRooms.get(roomId);
    
    if (!room) {
      // Try to get from database
      const appointment = await this.appointmentRepository.findOne({
        where: { roomId },
        relations: ['patient', 'patient.user', 'provider', 'provider.user'],
      });

      if (!appointment) {
        throw new BadRequestException('Room not found');
      }

      return {
        roomId,
        callStatus: appointment.callStatus,
        appointmentId: appointment.appointmentId,
        participants: [],
      };
    }

    return {
      roomId,
      callStatus: room.status,
      appointmentId: room.appointmentId,
      participants: room.participants,
      startTime: room.startTime,
      endTime: room.endTime,
    };
  }

  /**
   * Generate WebRTC configuration using PeerJS Cloud service
   */
  getWebRTCConfig() {
    return {
      // Using PeerJS cloud service for signaling
      host: 'peerjs-server.herokuapp.com',
      port: 443,
      path: '/myapp',
      secure: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
        ],
      },
    };
  }

  /**
   * Generate PeerJS room credentials
   */
  generatePeerCredentials(appointmentId: string) {
    const roomId = `medzen-${appointmentId}`;
    const patientPeerId = `patient-${appointmentId}-${Date.now()}`;
    const providerPeerId = `provider-${appointmentId}-${Date.now()}`;

    return {
      roomId,
      patientPeerId,
      providerPeerId,
      config: this.getWebRTCConfig(),
    };
  }

  /**
   * Get active rooms for monitoring
   */
  getActiveRooms() {
    return Array.from(this.activeRooms.entries()).map(([roomId, room]) => ({
      roomId,
      appointmentId: room.appointmentId,
      participantCount: room.participants.length,
      status: room.status,
      startTime: room.startTime,
    }));
  }

  /**
   * Handle call connection issues
   */
  async handleConnectionIssue(roomId: string, userId: string, issueType: string) {
    this.logger.warn(`Connection issue in room ${roomId} for user ${userId}: ${issueType}`);

    const room = this.activeRooms.get(roomId);
    if (!room) {
      return;
    }

    const participant = room.participants.find(p => p.userId === userId);
    if (participant) {
      participant.connectionIssues = participant.connectionIssues || [];
      participant.connectionIssues.push({
        type: issueType,
        timestamp: new Date(),
      });
    }

    this.activeRooms.set(roomId, room);
  }

  /**
   * Get call statistics
   */
  async getCallStatistics(appointmentId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
    });

    if (!appointment || !appointment.callStartedAt) {
      return null;
    }

    const duration = appointment.callEndedAt 
      ? appointment.callEndedAt.getTime() - appointment.callStartedAt.getTime()
      : Date.now() - appointment.callStartedAt.getTime();

    return {
      appointmentId,
      callStatus: appointment.callStatus,
      startTime: appointment.callStartedAt,
      endTime: appointment.callEndedAt,
      duration: Math.floor(duration / 1000), // duration in seconds
      roomId: appointment.roomId,
    };
  }
}