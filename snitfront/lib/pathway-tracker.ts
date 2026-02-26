/**
 * Pathway Event Tracker
 * Sends real-time activity events to Pathway analytics engine
 */

import { apiClient } from './api-client-new';

export type SpaceType = 'code' | 'writing' | 'reading' | 'whiteboard' | 'music' | 'chat' | 'timer';
export type EventType = 
  | 'keystroke' 
  | 'paste' 
  | 'blur' 
  | 'focus'
  | 'tab_switch' 
  | 'timer_tick'
  | 'music_play'
  | 'music_pause'
  | 'session_start'
  | 'session_end'
  | 'distraction'
  | 'intervention';

interface PathwayEvent {
  space_type: SpaceType;
  event_type: EventType;
  value?: number;
  metadata?: Record<string, any>;
}

class PathwayTracker {
  private enabled: boolean = true;
  private queue: PathwayEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL_MS = 5000; // 5 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      this.startBatchFlushing();
    }
  }

  /**
   * Track a single event
   */
  track(event: PathwayEvent) {
    if (!this.enabled) return;

    this.queue.push(event);

    // Flush immediately if queue is full
    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Track keystroke event
   */
  trackKeystroke(spaceType: SpaceType, metadata?: Record<string, any>) {
    this.track({
      space_type: spaceType,
      event_type: 'keystroke',
      value: 1,
      metadata,
    });
  }

  /**
   * Track paste event
   */
  trackPaste(spaceType: SpaceType, charCount: number) {
    this.track({
      space_type: spaceType,
      event_type: 'paste',
      value: charCount,
    });
  }

  /**
   * Track window blur (distraction)
   */
  trackBlur(spaceType: SpaceType) {
    this.track({
      space_type: spaceType,
      event_type: 'blur',
      value: 1,
    });
  }

  /**
   * Track window focus
   */
  trackFocus(spaceType: SpaceType) {
    this.track({
      space_type: spaceType,
      event_type: 'focus',
      value: 1,
    });
  }

  /**
   * Track tab switch
   */
  trackTabSwitch(fromSpace: SpaceType, toSpace: SpaceType) {
    this.track({
      space_type: fromSpace,
      event_type: 'tab_switch',
      value: 1,
      metadata: { to_space: toSpace },
    });
  }

  /**
   * Track music playback
   */
  trackMusicPlay(trackName: string, artist: string) {
    this.track({
      space_type: 'music',
      event_type: 'music_play',
      value: 1,
      metadata: { track: trackName, artist },
    });
  }

  /**
   * Track session start
   */
  trackSessionStart(spaceType: SpaceType) {
    this.track({
      space_type: spaceType,
      event_type: 'session_start',
      value: 1,
    });
  }

  /**
   * Track session end
   */
  trackSessionEnd(spaceType: SpaceType, duration: number) {
    this.track({
      space_type: spaceType,
      event_type: 'session_end',
      value: duration,
    });
  }

  /**
   * Track timer tick (every second during active session)
   */
  trackTimerTick(spaceType: SpaceType) {
    this.track({
      space_type: spaceType,
      event_type: 'timer_tick',
      value: 1,
    });
  }

  /**
   * Flush queued events to backend
   */
  private async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      // Send all events in batch
      await Promise.all(
        eventsToSend.map(event =>
          apiClient.post('/api/pathway/event', event).catch(err => {
            console.warn('Failed to send Pathway event:', err);
          })
        )
      );
    } catch (error) {
      console.error('Error flushing Pathway events:', error);
    }
  }

  /**
   * Start automatic batch flushing
   */
  private startBatchFlushing() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Stop tracking and flush remaining events
   */
  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Singleton instance
export const pathwayTracker = new PathwayTracker();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    pathwayTracker.stop();
  });
}
