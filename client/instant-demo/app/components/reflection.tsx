"use client";
import { Reflection } from "../lib/types";

interface ReflectionSectionProps {
	updateSliderColor: (value: string) => string;
	reflection: Reflection;
}
const ReflectionSection: React.FC<ReflectionSectionProps> = async ({ updateSliderColor, reflection }) => {
	return (
		<div>
			<div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Learning Outcomes</h2>
                <div id="learning_outcomes" className="min-h-[150px] bg-gray-50 p-4 rounded border">
				
				</div>
            </div>

            
            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Short-Term Next Steps</h2>
                <div id="next_steps_short_term" className="min-h-[150px] bg-gray-50 p-4 rounded border">
				
				</div>
            </div>

            
            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Long-Term Next Steps</h2>
                <div id="next_steps_long_term" className="min-h-[150px] bg-gray-50 p-4 rounded border">
				
				</div>
            </div>

            
            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Mood & Self-Reflection</h2>
                <div className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="productivity_level" className="block text-gray-800">Productivity Level:</label>
                        <input type="range" id="productivity_level" min="0" max="100" value="${reflection.productivity_level || 50}"
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer" onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>
                    </div>
                    <div>
                        <label htmlFor="distraction_level" className="block text-gray-800">Distraction Level:</label>
                        <input type="range" id="distraction_level" min="0" max="100" value="${reflection.distraction_level || 50}"
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer" onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>
                    </div>
                    <div>
                        <label htmlFor="desire_to_play_steam_games_level" className="block text-gray-800">Desire to Play Steam Games:</label>
                        <input type="range" id="desire_to_play_steam_games_level" min="0" max="100" value="${reflection.desire_to_play_steam_games_level || 50}"
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer" onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>
                    </div>
                    <div>
                        <label htmlFor="overall_frustration_level" className="block text-gray-800">Overall Frustration:</label>
                        <input type="range" id="overall_frustration_level" min="0" max="100" value="${reflection.overall_frustration_level || 50}"
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer" onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>
                    </div>
                </div>
            </div>
            <h1> AI Generated Reflection</h1>
            
            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Summary of Entire Blog</h2>
                <div id="entire_blog_summary" className="min-h-[150px] bg-gray-50 p-4 rounded border">
				${reflection.entire_blog_summary || ''}
				</div>
            </div>

            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Technical Challenges</h2>
                <div id="technical_challenges" className="min-h-[150px] bg-gray-50 p-4 rounded border">
				${reflection.technical_challenges || ''}
				</div>
            </div>

            
            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Interesting Bugs</h2>
                <div id="interesting_bugs" className="min-h-[150px] bg-gray-50 p-4 rounded border">
				${reflection.interesting_bugs || ''}
				</div>
            </div>

            
            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Unanswered Questions</h2>
                <div id="unanswered_questions" className="min-h-[150px] bg-gray-50 p-4 rounded border">
				${reflection.unanswered_questions || ''}
				</div>
            </div>

		</div>
	);
};
export default ReflectionSection;