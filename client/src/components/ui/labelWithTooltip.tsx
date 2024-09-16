import React from "react";
import CustomTooltip from "./customTooltip";

interface LabelWithTooltipProps {
	labelText: string;
	tooltipText: string;
}
export const LabelWithTooltip: React.FC<LabelWithTooltipProps> = ({
	labelText,
	tooltipText,
}) => {
	return (
		<div className="flex items-center space-x-1">
			<label className="px-2 text-lg">{labelText}</label>
			<CustomTooltip text={tooltipText} />
		</div>
	);
};

export default LabelWithTooltip;
