"use client";
import { Introduction } from "@/lib/types";
import { init, tx, id, InstantReactWeb } from '@instantdb/react';
import { TxChunk} from '@instantdb/core/src/instatx'
import { InstantGraph} from '@instantdb/core/src/schema'
import { DailyBlog } from "@/lib/types";
import { useEffect, useRef } from "react";
import { useQuill } from 'react-quilljs';
// or const { useQuill } = require('react-quilljs');

import 'quill/dist/quill.snow.css'; // Add css for snow theme
type Schema = {
	dailyBlogs: DailyBlog;
};

interface IntroductionSectionProps {
	updateSliderColor: (value: string) => string;
	selectedBlog: { id: string; } & DailyBlog;
	db: InstantReactWeb<Schema, {}, false>;
	tx: TxChunk<InstantGraph<any, any, {}>>;
}

const IntroductionSection: React.FC<IntroductionSectionProps> = ({ updateSliderColor, selectedBlog, db, tx }) => {
	console.log(`Rerendering IntroductionSection!`)
	function mergeField(field_name: string, field_value: string) {
		db.transact([
			tx.dailyBlogs[selectedBlog.id].merge({
				introduction: {
					[field_name]: field_value,
				},
			}),
		]);
	}
	
	let intro = selectedBlog.introduction;
	if (!intro) {
		const emptyIntroduction: Introduction = {
			personal_context: '',
			daily_goals: '',
			learning_focus: '',
			challenges: '',
			plan_of_action: '',
			focus_level: 50,
			enthusiasm_level: 50,
			burnout_level: 50,
			leetcode_hatred_level: 50,
			introduction_summary: ''
		};
		intro = emptyIntroduction;
	}

	const {quill: quill_personal_context, quillRef: quillRef_personal_context} = useQuill()
	useEffect(() => {
		if (quill_personal_context) {
			const key = 'personal_context'
			quill_personal_context.on('text-change', (delta, oldDelta, source) => {
				console.log(`Source: ${source}`)
				const htmlText = quill_personal_context.root.innerHTML;
				if (source === 'user') {

					mergeField(key, htmlText);
				}
		  });
		}
	  }, [quill_personal_context]);
	const {quill: quill_daily_goals, quillRef: quillRef_daily_goals} = useQuill()
	useEffect(() => {
		if (quill_daily_goals) {
			const key = 'daily_goals'
			quill_daily_goals.on('text-change', (delta, oldDelta, source) => {
				console.log(`Source: ${source}`)
				const htmlText = quill_daily_goals.root.innerHTML;
				if (source === 'user') {

					mergeField(key, htmlText);
				}
		  });
		}
	  }, [quill_daily_goals]);
	const {quill: quill_learning_focus, quillRef: quillRef_learning_focus} = useQuill()
	useEffect(() => {
		if (quill_learning_focus) {
			const key = 'learning_focus'
			quill_learning_focus.on('text-change', (delta, oldDelta, source) => {
				console.log(`Source: ${source}`)
				const htmlText = quill_learning_focus.root.innerHTML;
				if (source === 'user') {

					mergeField(key, htmlText);
				}
		  });
		}
	  }, [quill_learning_focus]);
	const {quill: quill_challenges, quillRef: quillRef_challenges} = useQuill()
	useEffect(() => {
		if (quill_challenges) {
			const key = 'challenges'
			quill_challenges.on('text-change', (delta, oldDelta, source) => {
				console.log(`Source: ${source}`)
				const htmlText = quill_challenges.root.innerHTML;
				if (source === 'user') {

					mergeField(key, htmlText);
				}
		  });
		}
	  }, [quill_challenges]);
	const {quill: quill_plan_of_action, quillRef: quillRef_plan_of_action} = useQuill()
	useEffect(() => {
		if (quill_plan_of_action) {
			const key = 'plan_of_action'
			quill_plan_of_action.on('text-change', (delta, oldDelta, source) => {
				console.log(`Source: ${source}`)
				const htmlText = quill_plan_of_action.root.innerHTML;
				if (source === 'user') {

					mergeField(key, htmlText);
				}
		  });
		}
	  }, [quill_plan_of_action]);
	

	

	return (
		<div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Context for the Day</h2>
				<div id="personal_context" className="min-h-[100px] bg-gray-50 p-4 rounded border mt-4" ref={quillRef_personal_context}>

				</div>
			</div>

			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Daily Goals</h2>
				<div id="daily_goals" className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_daily_goals}>

				</div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Learning Focus</h2>
				<div id="learning_focus" className="min-h-[100px] bg-gray-50 p-4 rounded border" ref={quillRef_learning_focus}>

				</div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Anticipated Challenges</h2>
				<div id="challenges" className="min-h-[100px] bg-gray-50 p-4 rounded border"ref={quillRef_challenges}></div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Plan of Action</h2>
				<div id="plan_of_action" className="min-h-[100px] bg-gray-50 p-4 rounded border" ref={quillRef_plan_of_action}></div>
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
					{intro.introduction_summary || ''}
				</div>
			</div>

		</div>


	);
};
export default IntroductionSection;