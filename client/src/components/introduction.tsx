"use client";
import { Introduction } from "@/lib/types";
import { init, tx, id } from '@instantdb/react';
import { DailyBlog } from "@/lib/types";
import { useEffect, useRef } from "react";
import { useQuill } from 'react-quilljs';
// or const { useQuill } = require('react-quilljs');

import 'quill/dist/quill.snow.css'; // Add css for snow theme


interface IntroductionSectionProps {
	updateSliderColor: (value: string) => string;
	id: string;
}

const APP_ID = '3b4a73a0-ffc6-488a-b883-550004ff6e0a';

type Schema = {
	dailyBlogs: DailyBlog;
};

const db = init<Schema>({ appId: APP_ID });

function mergeField(id: string, field_name: string, field_value: string) {
	db.transact([
		tx.dailyBlogs[id].merge({
			introduction: {
				[field_name]: field_value,
			},
		}),
	]);
}

const IntroductionSection: React.FC<IntroductionSectionProps> = ({ updateSliderColor, id }) => {
	

	const query = {
		dailyBlogs: {
			$: {
				where: {
					id: id,
				},
			},
		},
	};
	const { isLoading, error, data } = db.useQuery(query);
	if (isLoading) {
		return <p>Loading Introduction</p>;
	}
	if (error) {
		return <p>Error loading Introduction</p>;
	}
	let intro = data.dailyBlogs[0].introduction;
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

	const { quill: quill_personal_context, quillRef: quillRef_personal_context } = useQuill({
        modules: {
            toolbar: true
        },
        theme: 'snow'
    });

    const { quill: quill_daily_goals, quillRef: quillRef_daily_goals } = useQuill({
        modules: {
            toolbar: true
        },
        theme: 'snow'
    });
	const { quill: quill_learning_focus, quillRef: quillRef_learning_focus } = useQuill({
        modules: {
            toolbar: true
        },
        theme: 'snow'
    });
	const { quill: quill_challenges, quillRef: quillRef_challenges } = useQuill({
        modules: {
            toolbar: true
        },
        theme: 'snow'
    });
	const { quill: quill_plan_of_action, quillRef: quillRef_plan_of_action } = useQuill({
        modules: {
            toolbar: true
        },
        theme: 'snow'
    });
	const allQuills = [ ]

	useEffect(() => {
		if (quill && intro) {
			console.log(`Quill and intro are set!`)
			// Set initial value for Quill editor
			Object.keys(intro).forEach((key) => {
				if (key !== "focus_level" && key !== "enthusiasm_level" && key !== "burnout_level" && key !== "leetcode_hatred_level") {
					const editorElement = document.querySelector(`#${key} .ql-editor`);
					if (editorElement) {
						const value = intro![key]
						editorElement.innerHTML = value;
					}
				}
			});
	
			// Attach event listener for text changes
			quill.on('text-change', (delta, oldDelta, source) => {
				if (source === 'user') {
					const fieldName = quill.root.parentElement!.id;
					const htmlText = quill.root.innerHTML;
					mergeField(id, fieldName, htmlText);
				}
			});
		}
	}, [quill, intro]);  // Include intro in the dependency array
	

	return (
		<div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Context for the Day</h2>
				<div id="personal_context" className="min-h-[100px] bg-gray-50 p-4 rounded border mt-4" ref={quillRef}>

				</div>
			</div>

			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Daily Goals</h2>
				<div id="daily_goals" className="min-h-[150px] bg-gray-50 p-4 rounded border"ref={quillRef}>

				</div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Learning Focus</h2>
				<div id="learning_focus" className="min-h-[100px] bg-gray-50 p-4 rounded border"ref={quillRef}>

				</div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Anticipated Challenges</h2>
				<div id="challenges" className="min-h-[100px] bg-gray-50 p-4 rounded border"ref={quillRef}></div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Plan of Action</h2>
				<div id="plan_of_action" className="min-h-[100px] bg-gray-50 p-4 rounded border"ref={quillRef}></div>
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