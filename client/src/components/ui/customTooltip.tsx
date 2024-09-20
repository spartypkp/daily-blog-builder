import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/toolTip";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
interface CustomTooltipProps {
	text: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ text }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					{" "}
					<QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
				</TooltipTrigger>
				<TooltipContent>
					<p>{text || "Placeholder"}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
export default CustomTooltip;
