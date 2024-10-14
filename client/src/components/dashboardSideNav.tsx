"use client";
import Link from 'next/link';
import Image from 'next/image';
import { HomeIcon } from '@heroicons/react/24/solid';
import { Separator } from '@/components/ui/separator';
import { HeartIcon } from '@heroicons/react/24/solid';
import { ChartBarIcon } from '@heroicons/react/24/solid';
import { ScissorsIcon } from '@heroicons/react/24/solid';
import { BanknotesIcon } from '@heroicons/react/24/solid';
import { BuildingLibraryIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import { CogIcon } from '@heroicons/react/24/solid';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';


const DashboardSideNav: React.FC<{ clientId: string; }> = ({ clientId }) => {


	const [activeTab, setActiveTab] = useState("home");

	return (
		<nav className="overflow-y-auto">
			<Link href={`/dashboard/${clientId}`} className="flex items-center py-2 pl-2 text-sm hover:bg-accent" onClick={() => setActiveTab("home")}>
				<HomeIcon className="h-5 w-5 mr-2" /> Home
				{activeTab === "home" && (
					<span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>
				)}
			</Link>
			{/* Other section components */}
			<NetworkSection
				organizationId={clientId}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
			<OrganizationSection
				organizationId={clientId}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
			<BehaviorSection
				organizationId={clientId}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
			<AnalyticsSection
				organizationId={clientId}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
			<AppearanceSection
				organizationId={clientId}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
			<BillingSection
				organizationId={clientId}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
			<SettingsSection
				organizationId={clientId}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
		</nav>
	);
};

const OrganizationSection: React.FC<{ organizationId: string, activeTab: string, setActiveTab: (tab: string) => void; }> = ({ organizationId, activeTab, setActiveTab }) => {

	return (
		<div>
			<button className="flex pl-2 items-center w-full py-2 text-sm hover:bg-accent focus:outline-none" onClick={() => setActiveTab("organization")}>
				<BuildingLibraryIcon className="h-5 w-5 mr-2" />
				<Link href={`/dashboard/${organizationId}/organization`}>
					Organization Knowledge
				</Link>
				{activeTab === "organization" && (
					<span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>
				)}
			</button>
		</div>
	);
};
const NetworkSection: React.FC<{ organizationId: string, activeTab: string, setActiveTab: (tab: string) => void; }> = ({ organizationId, activeTab, setActiveTab }) => {

	return (
		<div>
			<button className="flex pl-2 items-center w-full py-2 text-sm hover:bg-accent focus:outline-none" onClick={() => setActiveTab("network")}>
				<UserGroupIcon className="h-5 w-5 mr-2" />
				<Link href={`/dashboard/${organizationId}/network`} className="">
					Network Directory
				</Link>
				{activeTab === "network" && (
					<span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>
				)}
			</button>
		</div>
	);
};


const AnalyticsSection: React.FC<{ organizationId: string, activeTab: string, setActiveTab: (tab: string) => void; }> = ({ organizationId, activeTab, setActiveTab }) => {

	return (
		<div>
			<button className="flex pl-2 items-center w-full py-2 text-sm hover:bg-accent focus:outline-none" onClick={() => setActiveTab("analytics")}>
				<ChartBarIcon className="h-5 w-5 mr-2" />
				<Link href={`/dashboard/${organizationId}/analytics#userEngagement`} className="">
					Analytics
				</Link>
				{activeTab === "analytics" && (
					<span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>
				)}
			</button>
		</div>
	);
};




const AppearanceSection: React.FC<{ organizationId: string, activeTab: string, setActiveTab: (tab: string) => void; }> = ({ organizationId, activeTab, setActiveTab }) => {
	return (
		<div>
			<button className="flex pl-2 items-center w-full py-2 text-sm hover:bg-accent focus:outline-none" onClick={() => setActiveTab("appearance")}>
				<ScissorsIcon className="h-5 w-5 mr-2" />
				<Link href={`/dashboard/${organizationId}/appearance`} className="">
					Appearance
				</Link>
				{activeTab === "appearance" && (
					<span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>
				)}
			</button>
		</div>
	);
};





const BillingSection: React.FC<{ organizationId: string, activeTab: string, setActiveTab: (tab: string) => void; }> = ({ organizationId, activeTab, setActiveTab }) => {

	return (
		<div>
			<button className="flex pl-2 items-center w-full py-2 text-sm hover:bg-accent focus:outline-none" onClick={() => setActiveTab("usage")}>
				<BanknotesIcon className="h-5 w-5 mr-2" />
				<Link href={`/dashboard/${organizationId}/usage`}>
				Usage and Billing
				</Link>
				{activeTab === "usage" && (
					<span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>
				)}
			</button>
		</div>
	);
};











const BehaviorSection: React.FC<{ organizationId: string, activeTab: string, setActiveTab: (tab: string) => void; }> = ({ organizationId, activeTab, setActiveTab }) => {

	return (
		<div>
			<button className="flex pl-2 items-center w-full py-2 text-sm hover:bg-accent focus:outline-none " onClick={() => setActiveTab("behavior")} >
				<AcademicCapIcon className="h-5 w-5 mr-2" /> Behavior Training
				{activeTab === "behavior" && (
					<span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>
				)}
			</button>

			<div className="pl-8">
				<Link href={`/dashboard/${organizationId}/behavior#greetings`} onClick={() => setActiveTab("behavior")} className={`flex items-center py-2 text-sm hover:bg-accent `}>
					Greetings
				</Link>
				<Link href={`/dashboard/${organizationId}/behavior#greetings`} onClick={() => setActiveTab("behavior")} className="flex items-center py-2 text-sm hover:bg-accent">
					Tool Use
				</Link>
				<Link href={`/dashboard/${organizationId}/behavior#greetings`} onClick={() => setActiveTab("behavior")} className="flex items-center py-2 text-sm hover:bg-accent">
					Escalation Protocol
				</Link>

			</div>

		</div>
	);
};




const SettingsSection: React.FC<{ organizationId: string, activeTab: string, setActiveTab: (tab: string) => void; }> = ({ organizationId, activeTab, setActiveTab }) => {

	return (
		<div>
			<button className="flex pl-2 items-center w-full py-2 text-sm hover:bg-accent focus:outline-none" onClick={() => setActiveTab("settings")}>
				<CogIcon className="h-5 w-5 mr-2" /> 

				<Link href={`/dashboard/${organizationId}/settings`} >
					Settings
				</Link>
				{activeTab === "settings" && (
					<span className="ml-2 w-2 h-2 bg-accent rounded-full"></span>
				)}
			</button>
		</div>
	);
};

export default DashboardSideNav;