"use client";
import { Reflection } from "../lib/types";
import { init, tx, id, InstantReactWeb } from '@instantdb/react';
import { TxChunk} from '@instantdb/core/src/instatx'
import { InstantGraph} from '@instantdb/core/src/schema'
import { DailyBlog } from "@/lib/types";
import { useEffect, useRef, useMemo } from "react";
import { useQuill } from 'react-quilljs';

type Schema = {
	dailyBlogs: DailyBlog;
};
interface ReflectionSectionProps {
	updateSliderColor: (value: string) => string;
	selectedBlog: { id: string; } & DailyBlog;
	db: InstantReactWeb<Schema, {}, false>;
	tx: TxChunk<InstantGraph<any, any, {}>>;
}

const ReflectionSection: React.FC<ReflectionSectionProps> = ({ updateSliderColor, selectedBlog, db, tx }) => {
	
	function mergeField(id: string, field_name: string, field_value: string) {
		db.transact([
			tx.dailyBlogs[id].merge({
				reflectionduction: {
					[field_name]: field_value,
				},
			}),
		]);
	}

	let reflection = selectedBlog.reflection
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

	const { quill: quill_learning_outcomes, quillRef: quillRef_learning_outcomes } = useQuill();
	useEffect(() => {
		if (quill_learning_outcomes && reflection) {
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
	const { quill: quill_next_steps_short_term, quillRef: quillRef_next_steps_short_term } = useQuill();
	useEffect(() => {
		if (quill_next_steps_short_term && reflection) {
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
	const { quill: quill_next_steps_long_term, quillRef: quillRef_next_steps_long_term } = useQuill();
	useEffect(() => {
		if (quill_next_steps_long_term && reflection) {
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
                        <label htmlFor="productivity_level" className="block text-gray-800">Productivity Level:</label>
                        <input type="range" id="productivity_level" min="0" max="100" value={reflection.productivity_level || 50}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer" onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>
                    </div>
                    <div>
                        <label htmlFor="distraction_level" className="block text-gray-800">Distraction Level:</label>
                        <input type="range" id="distraction_level" min="0" max="100" value={reflection.distraction_level || 50}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer" onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>
                    </div>
                    <div>
                        <label htmlFor="desire_to_play_steam_games_level" className="block text-gray-800">Desire to Play Steam Games:</label>
                        <input type="range" id="desire_to_play_steam_games_level" min="0" max="100" value={reflection.desire_to_play_steam_games_level || 50}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer" onInput={(e) => updateSliderColor((e.target as HTMLInputElement).value)}></input>
                    </div>
                    <div>
                        <label htmlFor="overall_frustration_level" className="block text-gray-800">Overall Frustration:</label>
                        <input type="range" id="overall_frustration_level" min="0" max="100" value={reflection.overall_frustration_level || 50}
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