"""
Pathway Intervention Engine for FlowState
Real-time intervention triggers based on cognitive patterns

Monitors flow scores and triggers personalized interventions
"""

import pathway as pw
import os
import logging

logger = logging.getLogger(__name__)

# ============================
# INTERVENTION RULES ENGINE
# ============================

def create_intervention_pipeline():
    """
    Real-time intervention detection
    Automatically triggers when patterns are detected
    """
    
    INPUT_DIR = "/app/input_stream"
    OUTPUT_DIR = "/app/interventions"
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    logger.info("🎯 Initializing Pathway Intervention Engine...")
    
    # Schema for events
    class EventSchema(pw.Schema):
        user_id: str
        space_type: str
        event_type: str
        value: float
        timestamp: str
    
    # INPUT: Stream events
    events = pw.io.csv.read(
        INPUT_DIR,
        schema=EventSchema,
        mode="streaming",
        autocommit_duration_ms=100
    )
    
    # ============================
    # PATTERN DETECTION
    # ============================
    
    # Pattern 1: Rapid context switching (multiple tab switches in short time)
    tab_switches = events.filter(pw.this.event_type == "tab_switch")
    
    # Count switches per user in 2-minute window
    switch_counts = tab_switches.windowby(
        tab_switches.timestamp,
        window=pw.temporal.tumbling(pw.Duration("2m")),
        instance=tab_switches.user_id
    ).reduce(
        user_id=pw.this._pw_instance,
        switch_count=pw.reducers.count(),
        window_end=pw.this._pw_window_end
    )
    
    # Trigger intervention if > 10 switches in 2 minutes
    context_switch_interventions = switch_counts.filter(
        pw.this.switch_count > 10
    ).select(
        user_id=pw.this.user_id,
        intervention_type=pw.const("reduce_context_switching"),
        severity=pw.const("medium"),
        message=pw.const("You've switched contexts 10+ times. Try focusing on one task."),
        data=pw.apply(lambda c: {"switch_count": c}, pw.this.switch_count),
        timestamp=pw.this.window_end
    )
    
    # Pattern 2: Extended blur (user away from app for > 5 minutes)
    blur_events = events.filter(pw.this.event_type == "blur")
    
    # Detect long absences
    long_blur_interventions = blur_events.select(
        user_id=pw.this.user_id,
        intervention_type=pw.const("return_from_break"),
        severity=pw.const("low"),
        message=pw.const("Welcome back! Ready to resume your flow?"),
        timestamp=pw.this.timestamp
    )
    
    # Pattern 3: No activity for extended period (burnout risk)
    # Group all events by user
    user_activity = events.groupby(events.user_id).reduce(
        user_id=pw.this.user_id,
        last_activity=pw.reducers.max(pw.this.timestamp),
        total_events=pw.reducers.count()
    )
    
    # Pattern 4: High keystroke velocity (potential stress)
    keystrokes = events.filter(pw.this.event_type == "keystroke")
    
    keystroke_velocity = keystrokes.windowby(
        keystrokes.timestamp,
        window=pw.temporal.tumbling(pw.Duration("1m")),
        instance=keystrokes.user_id
    ).reduce(
        user_id=pw.this._pw_instance,
        keystrokes_per_minute=pw.reducers.count(),
        window_end=pw.this._pw_window_end
    )
    
    # Trigger if > 200 keystrokes per minute (very high)
    high_velocity_interventions = keystroke_velocity.filter(
        pw.this.keystrokes_per_minute > 200
    ).select(
        user_id=pw.this.user_id,
        intervention_type=pw.const("slow_down"),
        severity=pw.const("high"),
        message=pw.const("You're typing very fast. Take a breath and slow down."),
        data=pw.apply(lambda k: {"kpm": k}, pw.this.keystrokes_per_minute),
        timestamp=pw.this.window_end
    )
    
    # ============================
    # COMBINE ALL INTERVENTIONS
    # ============================
    
    # Union all intervention streams
    all_interventions = context_switch_interventions.concat(
        long_blur_interventions
    ).concat(
        high_velocity_interventions
    )
    
    # ============================
    # OUTPUT
    # ============================
    
    # Write interventions to output
    pw.io.jsonlines.write(
        all_interventions,
        f"{OUTPUT_DIR}/interventions.jsonl"
    )
    
    # Also write by type for easier filtering
    pw.io.jsonlines.write(
        context_switch_interventions,
        f"{OUTPUT_DIR}/context_switch_interventions.jsonl"
    )
    
    pw.io.jsonlines.write(
        high_velocity_interventions,
        f"{OUTPUT_DIR}/high_velocity_interventions.jsonl"
    )
    
    logger.info("✅ Intervention engine configured")
    logger.info(f"📤 Interventions output: {OUTPUT_DIR}")
    
    return all_interventions

if __name__ == "__main__":
    create_intervention_pipeline()
    pw.run()
