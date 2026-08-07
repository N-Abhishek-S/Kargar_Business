export interface DomainEvent {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export class EventDispatcher {
  static async dispatch(event: DomainEvent): Promise<void> {
    // In production, this might push to a queue (like Inngest or Supabase queues)
    // For this implementation, we log structurally for the observability layer.
    console.info(JSON.stringify({
      type: 'DOMAIN_EVENT',
      event: event.eventName,
      data: event.payload,
      emittedAt: event.timestamp
    }));

    // Local synchronous handler routing
    if (event.eventName === 'MentorApproved') {
      await this.handleMentorApproved(event);
    }
  }

  private static async handleMentorApproved(event: DomainEvent) {
    console.info(JSON.stringify({ 
      action: 'NOTIFICATION_DISPATCH', 
      type: 'EMAIL', 
      to: event.payload.mentorId,
      template: 'mentor_welcome' 
    }));
  }
}

export const createEvent = (eventName: string, payload: Record<string, unknown>): DomainEvent => ({
  eventName,
  payload,
  timestamp: new Date().toISOString()
});
