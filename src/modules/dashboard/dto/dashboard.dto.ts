import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total number of patients' })
  totalPatients: number;

  @ApiProperty({ description: 'Total number of doctors' })
  totalDoctors: number;

  @ApiProperty({ description: 'Total number of nurses' })
  totalNurses: number;

  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Number of active users' })
  activeUsers: number;

  @ApiProperty({ description: 'Number of appointments today' })
  todayAppointments: number;

  @ApiProperty({ description: 'Number of pending appointments' })
  pendingAppointments: number;

  @ApiProperty({ description: 'Number of completed appointments' })
  completedAppointments: number;
}

export class ProviderDashboardStatsDto {
  @ApiProperty({ description: 'Total appointments for provider' })
  totalAppointments: number;

  @ApiProperty({ description: 'Appointments today' })
  todayAppointments: number;

  @ApiProperty({ description: 'Confirmed appointments' })
  confirmedAppointments: number;

  @ApiProperty({ description: 'Virtual consultations' })
  virtualConsultations: number;

  @ApiProperty({ description: 'Upcoming appointments' })
  upcomingAppointments: number;

  @ApiProperty({ description: 'Completed appointments today' })
  completedToday: number;

  @ApiProperty({ description: 'Total patients under care' })
  totalPatients: number;

  @ApiProperty({ description: 'New messages count' })
  newMessages: number;
}