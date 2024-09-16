

// Updated Task interface with additional AI generated fields
export interface Task {
    task_goal?: string;
    task_description?: string;
    task_expected_difficulty?: number;
    task_planned_approach?: string;
    task_progress_notes?: string;
    task_start_summary?: string;  // AI Generated field added
    time_spent_coding?: string;
    time_spent_researching?: string;
    time_spent_debugging?: string;
    task_reflection_summary?: string; // AI Generated field added
    output_or_result?: string;
    challenges_encountered?: string;
    follow_up_tasks?: string;
    reflection_successes?: string;
    reflection_failures?: string;
    research_questions?: string;
    tools_used?: string;
}
export function isDaveSection(interfaceType: Task | Reflection | Introduction, fieldName: string): boolean {
    const daveTaskFields: string[] = [
        "task_reflection_summary", 
        "output_or_result",
        "challenges_encountered",
        "follow_up_tasks",
        "reflection_successes",
        "reflection_failures",
        "research_questions",
        "tools_used"
    ];

    const daveReflectionFields: string[] = [
        "entire_blog_summary",
        "technical_challenges",
        "interesting_bugs",
        "unanswered_questions"
    ];

    const daveIntroductionFields: string[] = [
        "introduction_summary"
    ];

    if ("introduction_summary" in interfaceType) {
        return daveIntroductionFields.includes(fieldName);
    } else if ("entire_blog_summary" in interfaceType) {
        return daveReflectionFields.includes(fieldName);
    } else if ("task_reflection_summary" in interfaceType) {
        return daveTaskFields.includes(fieldName);
    }

    return false;
}

// Updated TaskFieldOrder array
export const TaskFieldOrder: (keyof Task)[] = [
	'task_start_summary',
	'task_reflection_summary',
    'task_goal',
    'task_description',
    'task_expected_difficulty',
    'task_planned_approach',
    'task_progress_notes',
     // Ensure AI generated fields are in the desired order
    'time_spent_coding',
    'time_spent_researching',
    'time_spent_debugging',
    'output_or_result',
    'challenges_encountered',
    'follow_up_tasks',
    'reflection_successes',
    'reflection_failures',
    'research_questions',
    'tools_used'
];



// Interfaces for Introduction Submodel
export interface Introduction {
    personal_context?: string;
    daily_goals?: string;
    learning_focus?: string;
    challenges?: string;
    plan_of_action?: string;
    focus_level?: number;
    enthusiasm_level?: number;
    burnout_level?: number;
    leetcode_hatred_level?: number;
	introduction_summary?: string;
}

export const IntroductionFieldOrder: (keyof Introduction)[] = [
	'introduction_summary',
    'personal_context',
    'daily_goals',
    'learning_focus',
    'challenges',
    'plan_of_action',
    'focus_level',
    'enthusiasm_level',
    'burnout_level',
    'leetcode_hatred_level'
];

// Updated Reflection interface with AI generated fields
export interface Reflection {
    learning_outcomes?: string;
    next_steps_short_term?: string;
    next_steps_long_term?: string;
    productivity_level?: number;
    distraction_level?: number;
    desire_to_play_steam_games_level?: number;
    overall_frustration_level?: number;
    entire_blog_summary?: string; // AI Generated field added
    technical_challenges?: string; // AI Generated field added
    interesting_bugs?: string; // AI Generated field added
    unanswered_questions?: string; // AI Generated field added
}

// Updated ReflectionFieldOrder array
export const ReflectionFieldOrder: (keyof Reflection)[] = [
	'entire_blog_summary',
    'technical_challenges',
    'interesting_bugs',
    'unanswered_questions',
    'learning_outcomes',
    'next_steps_short_term',
    'next_steps_long_term',
    'productivity_level',
    'distraction_level',
    'desire_to_play_steam_games_level',
    'overall_frustration_level'
     // New AI generated fields ordered logically
];


// Main Interface for Daily Blog
export interface DailyBlog {
    date: Date;
	day_count: number;
	blog_title: string;
	blog_description: string;
	blog_tags: any;
    introduction?: Introduction;
    tasks: Task[];
    reflection?: Reflection;
	status: string;
    created_at?: Date;
    updated_at?: Date;
}
