"use client";
import { Introduction } from "@/lib/types";
import { init, tx, id, InstantReactWeb } from '@instantdb/react';
import { TxChunk } from '@instantdb/core/src/instatx';
import { InstantGraph } from '@instantdb/core/src/schema';
import { DailyBlog } from "@/lib/types";
import { useEffect, useRef, useMemo } from "react";
import { useQuill } from 'react-quilljs';
import { selectLocalImage } from "@/lib/quillHelpers";
import { Slider } from "@nextui-org/slider";
import { CodeBlockContainer } from "quill/formats/code";
import Quill from "quill";
// or const { useQuill } = require('react-quilljs');

import 'quill/dist/quill.snow.css'; // Add css for snow theme

type Schema = {
	dailyBlogs: DailyBlog;
};

interface IntroductionSectionProps {
	selectedBlog: { id: string; } & DailyBlog;
	db: InstantReactWeb<Schema, {}, false>;
	tx: TxChunk<InstantGraph<any, any, {}>>;
}

const IntroductionSection: React.FC<IntroductionSectionProps> = ({ selectedBlog, db, tx }) => {

	function mergeField(id: string, field_name: string, field_value: string) {
		db.transact([
			tx.dailyBlogs[id].merge({
				introduction: {
					[field_name]: field_value,
				},
			}),
		]);
	}

	function mergeNumericField(id: string, field_name: string, field_value: number | number[]) {
		if (typeof (field_value) !== 'number') {
			field_value = field_value[0];
		}
		db.transact([
			tx.dailyBlogs[id].merge({
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
	const theme = "snow";
	const modules = {
		toolbar: {
			container: [
				['bold', 'italic', 'underline', 'strike'],
				['code-block'],
				[{ 'list': 'ordered' }, { 'list': 'bullet' }],
				[{ 'indent': '-1' }, { 'indent': '+1' }],
				[{ 'size': ['small', false, 'large', 'huge'] }],
				['image']],
			handlers: {
				'code-block': () => { console.log('code-block was clicked'); }
			}
		}
	};

	const getColor = (val: number, id: string) => {
		switch (id) {
			case 'enthusiasm_level':
				return val > 66 ? 'bg-green-500' : val > 33 ? 'bg-yellow-500' : 'bg-red-500';
			case 'burnout_level':
				return val > 66 ? 'bg-red-500' : val > 33 ? 'bg-yellow-500' : 'bg-green-500';
			case 'leetcode_hatred_level':
				return val > 66 ? 'bg-red-500' : val > 33 ? 'bg-purple-500' : 'bg-blue-500';
			case 'focus_level':
				return val > 66 ? 'bg-green-500' : val > 33 ? 'bg-orange-500' : 'bg-red-500';
			default:
				return 'bg-gray-200'; // Default color if none of the cases match
		}
	};

	const { quill: quill_personal_context, quillRef: quillRef_personal_context } = useQuill({ theme, modules });

	useEffect(() => {
		if (quill_personal_context && intro) {
			// Add custom image handler, which provides the quill object to embed image back into once saving
			(quill_personal_context.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_personal_context));
			// Initially set the Quill editors HTML
			quill_personal_context.clipboard.dangerouslyPasteHTML(intro.personal_context!);

			// Define which field to update in InstantDB, create handler to call MergeField 
			const key = 'personal_context';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_personal_context.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_personal_context.on('text-change', handler);

			// Return a cleanup function that explicitly returns void, NUKING it when no longer needed
			return () => {
				quill_personal_context.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_personal_context, selectedBlog.id]);

	const { quill: quill_daily_goals, quillRef: quillRef_daily_goals } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_daily_goals && intro) {
			(quill_daily_goals.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_daily_goals));
			quill_daily_goals.clipboard.dangerouslyPasteHTML(intro.daily_goals!);

			const key = 'daily_goals';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_daily_goals.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_daily_goals.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_daily_goals.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_daily_goals, selectedBlog.id]);
	const { quill: quill_learning_focus, quillRef: quillRef_learning_focus } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_learning_focus && intro) {
			(quill_learning_focus.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_learning_focus));
			quill_learning_focus.clipboard.dangerouslyPasteHTML(intro.learning_focus!);

			const key = 'learning_focus';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_learning_focus.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_learning_focus.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_learning_focus.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_learning_focus, selectedBlog.id]);
	const { quill: quill_challenges, quillRef: quillRef_challenges } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_challenges && intro) {
			(quill_challenges.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_challenges));
			quill_challenges.clipboard.dangerouslyPasteHTML(intro.challenges!);

			const key = 'challenges';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_challenges.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_challenges.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_challenges.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_challenges, selectedBlog.id]);
	const { quill: quill_plan_of_action, quillRef: quillRef_plan_of_action } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_plan_of_action && intro) {
			(quill_plan_of_action.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_plan_of_action));
			quill_plan_of_action.clipboard.dangerouslyPasteHTML(intro.plan_of_action!);

			const key = 'plan_of_action';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_plan_of_action.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_plan_of_action.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_plan_of_action.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_plan_of_action, selectedBlog.id]);


	// Resetting normal console warning functionality

	useMemo(() => {
		if (intro) {
			if (intro.personal_context && quill_personal_context) {
				quill_personal_context.clipboard.dangerouslyPasteHTML(intro.personal_context);
			}
			if (quill_daily_goals && intro.daily_goals) {
				quill_daily_goals.clipboard.dangerouslyPasteHTML(intro.daily_goals);
			}
			if (quill_learning_focus && intro.learning_focus) {
				quill_learning_focus.clipboard.dangerouslyPasteHTML(intro.learning_focus);
			}
			if (intro.challenges && quill_challenges) {
				quill_challenges.clipboard.dangerouslyPasteHTML(intro.challenges);
			}
			if (quill_plan_of_action && intro.plan_of_action) {
				quill_plan_of_action.clipboard.dangerouslyPasteHTML(intro.plan_of_action);
			}

		}

	}, [selectedBlog.id]);


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
				<div id="challenges" className="min-h-[100px] bg-gray-50 p-4 rounded border" ref={quillRef_challenges}></div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 pb-4">Plan of Action</h2>
				<div id="plan_of_action" className="min-h-[100px] bg-gray-50 p-4 rounded border" ref={quillRef_plan_of_action}></div>
			</div>
			<div className="mt-4 bg-white rounded-lg p-4">

				<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Enthusiasm Level</h2>
				<Slider
					key="enthusiasm_level"
					aria-label="enthusiasm_level"
					minValue={0}
					step={1}
					maxValue={100}
					defaultValue={intro.enthusiasm_level || 50}
					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `${getColor(intro.enthusiasm_level || 50, "enthusiasm_level")}`,
						thumb: `transition-transform ${getColor(intro.enthusiasm_level || 50, "enthusiasm_level")} shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "enthusiasm_level", value)}></Slider>

				<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Burnout Level</h2>
				<Slider
					key="burnout_level"
					aria-label="burnout_level"
					minValue={0}
					step={1}
					maxValue={100}
					defaultValue={intro.burnout_level || 50}
					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `${getColor(intro.burnout_level || 50, "burnout_level")}`,
						thumb: `transition-transform ${getColor(intro.burnout_level || 50, "burnout_level")} shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "burnout_level", value)}></Slider>

				<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">LeetCode Hatred</h2>
				<Slider
					key="leetcode_hatred_level"
					aria-label="leetcode_hatred_level"
					minValue={0}
					step={1}
					maxValue={100}
					defaultValue={intro.leetcode_hatred_level || 50}
					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `${getColor(intro.leetcode_hatred_level || 50, "leetcode_hatred_level")}`,
						thumb: `transition-transform ${getColor(intro.leetcode_hatred_level || 50, "leetcode_hatred_level")} shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "leetcode_hatred_level", value)}></Slider>

				<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Focus Level</h2>
				<Slider
					key="focus_level"
					aria-label="focus_level"
					minValue={0}
					step={1}
					maxValue={100}
					defaultValue={intro.focus_level || 50}

					classNames={{
						base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
						filler: `${getColor(intro.focus_level || 50, "focus_level")}`,
						thumb: `transition-transform ${getColor(intro.focus_level || 50, "focus_level")} shadow-small rounded-full w-5 h-5`
					}}
					onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "focus_level", value)}>
				</Slider>


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