import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Activity } from '@prisma/client';

interface CreateActivityDto {
  type: string;
  date: string;
  duration: number;
  distance: number;
  photo?: string;
  ownerId: string;
}

interface UpdateActivityDto {
  type?: string;
  date?: string;
  duration?: number;
  distance?: number;
  photo?: string;
}

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async createActivity(data: CreateActivityDto): Promise<Activity> {
    return this.prisma.activity.create({
      data: {
        type: data.type,
        date: data.date,
        duration: data.duration,
        distance: data.distance,
        photo: data.photo || null,
        ownerId: data.ownerId,
      },
    });
  }

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActivityById(id: string): Promise<Activity | null> {
    return this.prisma.activity.findUnique({
      where: { id },
    });
  }

  async getAllActivities(): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateActivity(
    id: string,
    userId: string,
    data: UpdateActivityDto,
  ): Promise<Activity> {
    return this.prisma.activity.update({
      where: { id },
      data,
    });
  }

  async deleteActivity(id: string): Promise<Activity> {
    return this.prisma.activity.delete({
      where: { id },
    });
  }
}
