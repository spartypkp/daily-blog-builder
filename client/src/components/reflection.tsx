"use client";
import { Reflection } from "../lib/types";
import { init, tx, id, InstantReactWeb } from '@instantdb/react';
import { TxChunk } from '@instantdb/core/src/instatx';
import { InstantGraph } from '@instantdb/core/src/schema';
import { DailyBlog } from "@/lib/types";
import { useEffect, useRef, useMemo } from "react";
import { useQuill } from 'react-quilljs';
import { Slider } from "@nextui-org/slider";
import { selectLocalImage } from "@/lib/quillHelpers";
type Schema = {
	dailyBlogs: DailyBlog;
};
interface ReflectionSectionProps {
	selectedBlog: { id: string; } & DailyBlog;
	db: InstantReactWeb<Schema, {}, false>;
	tx: TxChunk<InstantGraph<any, any, {}>>;
}

const ReflectionSection: React.FC<ReflectionSectionProps> = ({ selectedBlog, db, tx }) => {

	function mergeField(id: string, field_name: string, field_value: string) {
		db.transact([
			tx.dailyBlogs[id].merge({
				reflection: {
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
				reflection: {
					[field_name]: field_value,
				},
			}),
		]);
	}

	let reflection = selectedBlog.reflection;
	if (!reflection) {
		const emptyReflection: Reflection = {
			learning_outcomes: '',
			next_steps_short_term: '',
			next_steps_long_term: '',
			productivity_level: 50,
			distraction_level: 50,
			desire_to_play_steam_games_level: 50,
			overall_frustration_level: 50,
			entire_blog_summary: '',
			technical_challenges: '',
			interesting_bugs: '',
			unanswered_questions: ''
		};
		reflection = emptyReflection;
	}

	

	

	const getColor = (value: number, id: string) => {
		let newColorClass = '';
		switch (id) {
			case 'productivity_level':
				newColorClass = value > 66 ? 'bg-green-500' : value > 33 ? 'bg-green-300' : 'bg-green-100';
				break;
			case 'distraction_level':
				newColorClass = value > 66 ? 'bg-yellow-500' : value > 33 ? 'bg-yellow-300' : 'bg-yellow-100';
				break;
			case 'desire_to_play_steam_games_level':
				newColorClass = value > 66 ? 'bg-purple-500' : value > 33 ? 'bg-purple-300' : 'bg-purple-100';
				break;
			case 'overall_frustration_level':
				newColorClass = value > 66 ? 'bg-red-500' : value > 33 ? 'bg-red-300' : 'bg-red-100';
				break;
			default:
				return 'bg-gray-200'; // Default color if none of the cases match
		}
		return newColorClass;
	};

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

	const { quill: quill_learning_outcomes, quillRef: quillRef_learning_outcomes } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_learning_outcomes && reflection) {
			(quill_learning_outcomes.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_learning_outcomes));
			quill_learning_outcomes.clipboard.dangerouslyPasteHTML(reflection.learning_outcomes!);

			const key = 'learning_outcomes';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_learning_outcomes.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_learning_outcomes.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_learning_outcomes.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_learning_outcomes, selectedBlog.id]);
	const { quill: quill_next_steps_short_term, quillRef: quillRef_next_steps_short_term } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_next_steps_short_term && reflection) {
			(quill_next_steps_short_term.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_next_steps_short_term));
			quill_next_steps_short_term.clipboard.dangerouslyPasteHTML(reflection.next_steps_short_term!);

			const key = 'next_steps_short_term';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_next_steps_short_term.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_next_steps_short_term.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_next_steps_short_term.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_next_steps_short_term, selectedBlog.id]);
	const { quill: quill_next_steps_long_term, quillRef: quillRef_next_steps_long_term } = useQuill({ theme, modules });
	useEffect(() => {
		if (quill_next_steps_long_term && reflection) {
			(quill_next_steps_long_term.getModule('toolbar') as any).addHandler('image', () => selectLocalImage(quill_next_steps_long_term));
			quill_next_steps_long_term.clipboard.dangerouslyPasteHTML(reflection.next_steps_long_term!);

			const key = 'next_steps_long_term';
			const handler = (delta: any, oldDelta: any, source: string) => {
				if (source === 'user') {
					const htmlText = quill_next_steps_long_term.root.innerHTML;

					mergeField(selectedBlog.id, key, htmlText);
				}
			};

			quill_next_steps_long_term.on('text-change', handler);

			// Return a cleanup function that explicitly returns void
			return () => {
				quill_next_steps_long_term.off('text-change', handler);
			};
		}
		// Ensure that this effect runs only when necessary
	}, [quill_next_steps_long_term, selectedBlog.id]);

	

	useMemo(() => {
		if (reflection) {
			if (reflection.learning_outcomes && quill_learning_outcomes) {
				quill_learning_outcomes.clipboard.dangerouslyPasteHTML(reflection.learning_outcomes);
			}
			if (quill_next_steps_short_term && reflection.next_steps_short_term) {
				quill_next_steps_short_term.clipboard.dangerouslyPasteHTML(reflection.next_steps_short_term);
			}
			if (quill_next_steps_long_term && reflection.next_steps_long_term) {
				quill_next_steps_long_term.clipboard.dangerouslyPasteHTML(reflection.next_steps_long_term);
			}

		}

	}, [selectedBlog.id]);





	return (
		<div>
			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Learning Outcomes</h2>
				<div id="learning_outcomes" className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_learning_outcomes}>

				</div>
			</div>


			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Short-Term Next Steps</h2>
				<div id="next_steps_short_term" className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_next_steps_short_term}>

				</div>
			</div>


			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Long-Term Next Steps</h2>
				<div id="next_steps_long_term" className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quillRef_next_steps_long_term}>

				</div>
			</div>


			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Mood & Self-Reflection</h2>
				<div className="space-y-4 mt-4">
					<div>
						<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Productivity Level:</h2>
						<Slider
							key="productivity_level"
							aria-label="productivity_level"
							minValue={0}
							step={1}
							maxValue={100}
							defaultValue={reflection.productivity_level || 50}

							classNames={{
								base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
								filler: `${getColor(reflection.productivity_level || 50, "productivity_level")}`,
								thumb: `transition-transform ${getColor(reflection.productivity_level || 50, "productivity_level")} shadow-small rounded-full w-5 h-5`
							}}
							onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "productivity_level", value)}>
						</Slider>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Distraction Level:</h2>
						<Slider
							key="distraction_level"
							aria-label="distraction_level"
							minValue={0}
							step={1}
							maxValue={100}
							defaultValue={reflection.distraction_level || 50}

							classNames={{
								base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
								filler: `${getColor(reflection.distraction_level || 50, "distraction_level")}`,
								thumb: `transition-transform ${getColor(reflection.distraction_level || 50, "distraction_level")} shadow-small rounded-full w-5 h-5`
							}}
							onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "distraction_level", value)}>
						</Slider>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Desire to Play Steam Games:</h2>
						<Slider
							key="desire_to_play_steam_games_level"
							aria-label="desire_to_play_steam_games_level"
							minValue={0}
							step={1}
							maxValue={100}
							defaultValue={reflection.desire_to_play_steam_games_level || 50}

							classNames={{
								base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
								filler: `${getColor(reflection.desire_to_play_steam_games_level || 50, "desire_to_play_steam_games_level")}`,
								thumb: `transition-transform ${getColor(reflection.desire_to_play_steam_games_level || 50, "desire_to_play_steam_games_level")} shadow-small rounded-full w-5 h-5`
							}}
							onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "desire_to_play_steam_games_level", value)}>
						</Slider>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-gray-800 text-center mt-4">Overall Frustration Level:</h2>
						<Slider
							key="overall_frustration_level"
							aria-label="overall_frustration_level"
							minValue={0}
							step={1}
							maxValue={100}
							defaultValue={reflection.overall_frustration_level || 50}

							classNames={{
								base: `w-full h-2 bg-gray-200 rounded-lg  appearance-none cursor-pointer`,
								filler: `${getColor(reflection.overall_frustration_level || 50, "overall_frustration_level")}`,
								thumb: `transition-transform ${getColor(reflection.overall_frustration_level || 50, "overall_frustration_level")} shadow-small rounded-full w-5 h-5`
							}}
							onChangeEnd={(value) => mergeNumericField(selectedBlog.id, "overall_frustration_level", value)}>
						</Slider>
					</div>
				</div>
			</div>
			<h1> AI Generated Reflection</h1>

			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Summary of Entire Blog</h2>
				<div id="entire_blog_summary" className="min-h-[150px] bg-gray-50 p-4 rounded border">
					{reflection.entire_blog_summary || ''}
				</div>
			</div>

			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Technical Challenges</h2>
				<div id="technical_challenges" className="min-h-[150px] bg-gray-50 p-4 rounded border">
					{reflection.technical_challenges || ''}
				</div>
			</div>


			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Interesting Bugs</h2>
				<div id="interesting_bugs" className="min-h-[150px] bg-gray-50 p-4 rounded border">
					{reflection.interesting_bugs || ''}
				</div>
			</div>


			<div className="mt-4 bg-white rounded-lg p-4">
				<h2 className="text-3xl font-bold text-gray-800 text-center">Unanswered Questions</h2>
				<div id="unanswered_questions" className="min-h-[150px] bg-gray-50 p-4 rounded border">
					{reflection.unanswered_questions || ''}
				</div>
			</div>

		</div>
	);
};
export default ReflectionSection;