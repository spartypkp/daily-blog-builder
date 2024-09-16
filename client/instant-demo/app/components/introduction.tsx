"use client";
import { Introduction } from "../lib/types";

interface IntroductionSectionProps {
	updateSliderColor: (value: string) => string;
	intro: Introduction;
}
const IntroductionSection: React.FC<IntroductionSectionProps> = async ({ updateSliderColor, intro }) => {
	return (
		<div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Context for the Day</h2>
				<div id="personal_context" className="min-h-[100px] bg-gray-50 p-4 rounded border mt-4">

				</div>
			</div>

			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Daily Goals</h2>
				<div id="daily_goals" className="min-h-[150px] bg-gray-50 p-4 rounded border">

				</div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Learning Focus</h2>
				<div id="learning_focus" className="min-h-[100px] bg-gray-50 p-4 rounded border">

				</div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Anticipated Challenges</h2>
				<div id="challenges" className="min-h-[100px] bg-gray-50 p-4 rounded border"></div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Plan of Action</h2>
				<div id="plan_of_action" className="min-h-[100px] bg-gray-50 p-4 rounded border"></div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">

				<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Enthusiasm Level</h2>
				<input type="range" id="enthusiasm_level" min="0" max="100"
					value="${intro.enthusiasm_level || 50}"
					className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
					onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>

				<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Burnout Level</h2>
				<input type="range" id="burnout_level" min="0" max="100"
					value="${intro.burnout_level || 50}"
					className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
					onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>

				<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">LeetCode Hatred</h2>
				<input type="range" id="leetcode_hatred_level" min="0" max="100"
					value="${intro.leetcode_hatred_level || 50}"
					className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
					onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>

				<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Focus Level</h2>
				<input type="range" id="focus_level" min="0" max="100"
					value="${intro.focus_level || 50}"
					className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
					onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>

			</div>

			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Introduction Summary and Teaser</h2>
				<div id="introduction_summary" className="min-h-[150px] bg-gray-50 p-4 rounded border">
					${intro.introduction_summary || ''}
				</div>
			</div>

		</div>


	);
};
export default IntroductionSection;