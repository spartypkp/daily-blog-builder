"use client";
import { Reflection } from "../lib/types";
import { init, tx, id, InstantReactWeb } from '@instantdb/react';
import { TxChunk} from '@instantdb/core/src/instatx'
import { InstantGraph} from '@instantdb/core/src/schema'
import { DailyBlog } from "@/lib/types";
import { useEffect, useRef } from "react";
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
	
	function mergeField(field_name: string, field_value: string) {
		db.transact([
			tx.dailyBlogs[selectedBlog.id].merge({
				introduction: {
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

	const quills = [
        { key: 'learning_outcomes', quill: useQuill({ modules: { toolbar: true }, theme: 'snow' }) },
        { key: 'next_steps_short_term', quill: useQuill({ modules: { toolbar: true }, theme: 'snow' }) },
        { key: 'next_steps_long_term', quill: useQuill({ modules: { toolbar: true }, theme: 'snow' }) },
    ];

	useEffect(() => {
        quills.forEach(({ key, quill }) => {
            if (quill.quill && reflection) {
                const editorElement = document.querySelector(`#${key} .ql-editor`);
                if (editorElement) {
                    editorElement.innerHTML = reflection[key] || '';
                }

                // Attach event listener for text changes
                quill.quill.on('text-change', (delta, oldDelta, source) => {
                    if (source === 'user') {
                        const htmlText = quill.quill!.root.innerHTML;
                        mergeField(key, htmlText);
                    }
                });
            }
        });
    }, [quills.map(q => q.quill.quill), reflection]); // Notice how dependencies are set
	return (
		<div>
			<div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Learning Outcomes</h2>
                <div id="learning_outcomes" className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quills.find(quill => quill.key === 'learning_outcomes')?.quill.quillRef}>
				
				</div>
            </div>

            
            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Short-Term Next Steps</h2>
                <div id="next_steps_short_term" className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quills.find(quill => quill.key === 'next_steps_short_term')?.quill.quillRef}>
				
				</div>
            </div>

            
            <div className="mt-4 bg-white rounded-lg p-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center">Long-Term Next Steps</h2>
                <div id="next_steps_long_term" className="min-h-[150px] bg-gray-50 p-4 rounded border" ref={quills.find(quill => quill.key === 'next_steps_long_term')?.quill.quillRef}>
				
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