import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesService } from './activities.service';

@Controller('api/activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(AuthGuard('cognito'))
  async createActivity(@Request() req, @Body() body: any) {
    try {
      const activity = await this.activitiesService.createActivity({
        type: body.type,
        date: body.date,
        duration: body.duration,
        distance: body.distance || 0,
        photo: body.photo || body.photoUrl,
        ownerId: req.user.id,
      });
      return activity;
    } catch (error) {
      throw new BadRequestException('Failed to create activity');
    }
  }

  @Get()
  async getAllActivities() {
    return this.activitiesService.getAllActivities();
  }

  @Get('user/:userId')
  async getActivitiesByUser(@Param('userId') userId: string) {
    return this.activitiesService.getActivitiesByUser(userId);
  }

  @Get(':id')
  async getActivityById(@Param('id') id: string) {
    return this.activitiesService.getActivityById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('cognito'))
  async deleteActivity(@Param('id') id: string, @Request() req) {
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity || activity.ownerId !== req.user.id) {
      throw new BadRequestException('Unauthorized or activity not found');
    }
    return this.activitiesService.deleteActivity(id);
  }
}
