import { Link } from "@tanstack/react-router";
import { Footer } from "@/web/components/footer";
import { Button } from "@/web/components/ui/button";

function AnimatedFeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="group relative overflow-hidden border-2 border-border bg-background p-6 transition-all hover:border-white">
			<div className="mb-6 flex h-64 items-center justify-center border-2 border-border bg-muted/10">
				{icon}
			</div>
			<h3 className="mb-3 font-bold font-mono text-base uppercase tracking-widest">
				{title}
			</h3>
			<p className="font-mono text-muted-foreground text-xs leading-relaxed">
				{description}
			</p>
		</div>
	);
}

function MultiModelIcon() {
	return (
		<div className="relative h-full w-full p-4">
			<svg
				className="h-full w-full"
				viewBox="0 0 200 200"
				role="img"
				aria-label="Multi-platform support diagram"
			>
				<defs>
					<pattern
						id="grid"
						width="20"
						height="20"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 20 0 L 0 0 0 20"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							className="text-border"
						/>
					</pattern>
				</defs>
				<rect width="200" height="200" fill="url(#grid)" opacity="0.3" />

				<circle
					cx="100"
					cy="100"
					r="18"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					className="text-foreground"
				/>
				<circle
					cx="100"
					cy="100"
					r="12"
					fill="currentColor"
					className="text-foreground"
				>
					<animate
						attributeName="opacity"
						values="1;0.5;1"
						dur="2s"
						repeatCount="indefinite"
					/>
				</circle>

				{[
					{ x: 40, y: 40, delay: "0s", id: "node-1" },
					{ x: 160, y: 40, delay: "0.4s", id: "node-2" },
					{ x: 40, y: 160, delay: "0.8s", id: "node-3" },
					{ x: 160, y: 160, delay: "1.2s", id: "node-4" },
				].map((node) => (
					<g key={node.id}>
						<line
							x1={node.x}
							y1={node.y}
							x2="100"
							y2="100"
							stroke="currentColor"
							strokeWidth="2.5"
							className="text-foreground/30"
							strokeDasharray="150"
						>
							<animate
								attributeName="stroke-dashoffset"
								values="150;0;-150"
								dur="3s"
								begin={node.delay}
								repeatCount="indefinite"
							/>
						</line>
						<rect
							x={node.x - 8}
							y={node.y - 8}
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							className="text-border"
						>
							<animate
								attributeName="opacity"
								values="0.5;1;0.5"
								dur="2s"
								begin={node.delay}
								repeatCount="indefinite"
							/>
						</rect>
					</g>
				))}
			</svg>
		</div>
	);
}

function MCPIcon() {
	return (
		<div className="relative h-full w-full p-4">
			<svg
				className="h-full w-full"
				viewBox="0 0 200 200"
				role="img"
				aria-label="Real-time tracking with streaming output"
			>
				<defs>
					<pattern
						id="grid-mcp"
						width="20"
						height="20"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 20 0 L 0 0 0 20"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							className="text-border"
						/>
					</pattern>
				</defs>
				<rect width="200" height="200" fill="url(#grid-mcp)" opacity="0.3" />

				<g>
					<rect
						x="20"
						y="50"
						width="160"
						height="32"
						fill="currentColor"
						className="text-muted/20"
						rx="3"
					/>
					<rect
						x="20"
						y="50"
						width="4"
						height="32"
						fill="currentColor"
						className="text-foreground"
						rx="1.5"
					/>
					<text
						x="30"
						y="69"
						className="fill-current font-bold font-mono text-[11px] text-foreground"
					>
						track_event
					</text>
					<rect
						x="95"
						y="58"
						width="42"
						height="15"
						rx="2"
						fill="currentColor"
						className="text-foreground"
						opacity="0.9"
					/>
					<text
						x="116"
						y="69"
						textAnchor="middle"
						className="fill-background font-bold font-mono text-[8px]"
					>
						LIVE
					</text>
				</g>

				{[
					{ y: 95, width: 150, id: "line-1", delay: 0 },
					{ y: 108, width: 145, id: "line-2", delay: 0.3 },
					{ y: 121, width: 155, id: "line-3", delay: 0.6 },
					{ y: 134, width: 130, id: "line-4", delay: 0.9 },
					{ y: 147, width: 140, id: "line-5", delay: 1.2 },
					{ y: 160, width: 148, id: "line-6", delay: 1.5 },
				].map((line) => (
					<rect
						key={line.id}
						x="30"
						y={line.y}
						height="6"
						rx="1.5"
						fill="currentColor"
						className="text-foreground"
						opacity="0"
					>
						<animate
							attributeName="width"
							values={`0;${line.width};${line.width};${line.width};0`}
							dur="6s"
							begin={`${line.delay}s`}
							repeatCount="indefinite"
							keyTimes="0;0.15;0.6;0.8;1"
						/>
						<animate
							attributeName="opacity"
							values="0;0.3;0.3;0.3;0"
							dur="6s"
							begin={`${line.delay}s`}
							repeatCount="indefinite"
							keyTimes="0;0.1;0.6;0.8;1"
						/>
					</rect>
				))}
			</svg>
		</div>
	);
}

function EdgeComputingIcon() {
	return (
		<div className="relative h-full w-full p-4">
			<svg
				className="h-full w-full"
				viewBox="0 0 200 200"
				role="img"
				aria-label="Global edge computing network"
			>
				<defs>
					<pattern
						id="grid-edge"
						width="20"
						height="20"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 20 0 L 0 0 0 20"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							className="text-border"
						/>
					</pattern>
				</defs>
				<rect width="200" height="200" fill="url(#grid-edge)" opacity="0.3" />

				{/* Globe circle */}
				<circle
					cx="100"
					cy="100"
					r="55"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					className="text-foreground"
				/>

				{/* Latitude lines */}
				<ellipse
					cx="100"
					cy="100"
					rx="55"
					ry="15"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					className="text-foreground/30"
				/>
				<ellipse
					cx="100"
					cy="100"
					rx="55"
					ry="30"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					className="text-foreground/30"
				/>

				{/* Longitude lines */}
				<ellipse
					cx="100"
					cy="100"
					rx="15"
					ry="55"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					className="text-foreground/30"
				/>
				<ellipse
					cx="100"
					cy="100"
					rx="30"
					ry="55"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					className="text-foreground/30"
				/>

				{/* Orbiting data points */}
				{[
					{ angle: 0, delay: "0s", id: "orbit-1" },
					{ angle: 90, delay: "0.5s", id: "orbit-2" },
					{ angle: 180, delay: "1s", id: "orbit-3" },
					{ angle: 270, delay: "1.5s", id: "orbit-4" },
				].map((point) => (
					<g key={point.id}>
						<circle r="4" fill="currentColor" className="text-foreground">
							<animateTransform
								attributeName="transform"
								type="rotate"
								from={`${point.angle} 100 100`}
								to={`${point.angle + 360} 100 100`}
								dur="8s"
								begin={point.delay}
								repeatCount="indefinite"
							/>
							<animate
								attributeName="opacity"
								values="0.3;1;0.3"
								dur="2s"
								begin={point.delay}
								repeatCount="indefinite"
							/>
						</circle>
						<circle
							cx="100"
							cy="45"
							r="4"
							fill="currentColor"
							className="text-foreground"
							opacity="0"
						>
							<animateTransform
								attributeName="transform"
								type="rotate"
								from={`${point.angle} 100 100`}
								to={`${point.angle + 360} 100 100`}
								dur="8s"
								begin={point.delay}
								repeatCount="indefinite"
							/>
							<animate
								attributeName="opacity"
								values="0.3;1;0.3"
								dur="2s"
								begin={point.delay}
								repeatCount="indefinite"
							/>
						</circle>
					</g>
				))}

				{/* Edge location markers */}
				{[
					{ x: 65, y: 65, label: "US", id: "edge-us" },
					{ x: 135, y: 65, label: "EU", id: "edge-eu" },
					{ x: 100, y: 45, label: "AS", id: "edge-asia" },
					{ x: 65, y: 135, label: "SA", id: "edge-sa" },
					{ x: 135, y: 135, label: "AU", id: "edge-au" },
				].map((edge, i) => (
					<g key={edge.id}>
						<circle
							cx={edge.x}
							cy={edge.y}
							r="6"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="text-foreground"
						>
							<animate
								attributeName="opacity"
								values="0.5;1;0.5"
								dur="3s"
								begin={`${i * 0.2}s`}
								repeatCount="indefinite"
							/>
						</circle>
						<text
							x={edge.x}
							y={edge.y + 3}
							textAnchor="middle"
							className="fill-current font-bold font-mono text-[8px] text-foreground"
						>
							{edge.label}
						</text>
					</g>
				))}

				{/* Pulsing ring */}
				<circle
					cx="100"
					cy="100"
					r="55"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className="text-foreground/20"
				>
					<animate
						attributeName="r"
						values="55;65;55"
						dur="3s"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="opacity"
						values="0.5;0;0.5"
						dur="3s"
						repeatCount="indefinite"
					/>
				</circle>
			</svg>
		</div>
	);
}

function DataReplicationIcon() {
	return (
		<div className="relative h-full w-full p-4">
			<svg
				className="h-full w-full"
				viewBox="0 0 200 200"
				role="img"
				aria-label="Data replication to multiple pixels"
			>
				<defs>
					<pattern
						id="grid-replication"
						width="20"
						height="20"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 20 0 L 0 0 0 20"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							className="text-border"
						/>
					</pattern>
				</defs>
				<rect
					width="200"
					height="200"
					fill="url(#grid-replication)"
					opacity="0.3"
				/>

				{/* Central Hub */}
				<rect
					x="75"
					y="90"
					width="50"
					height="35"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					className="text-foreground"
					rx="3"
				/>
				<text
					x="100"
					y="113"
					textAnchor="middle"
					className="fill-current font-bold font-mono text-foreground text-sm"
				>
					TRAKI
				</text>

				{/* Users above */}
				{[
					{ x: 40, y: 35, label: "U1", id: "user-1" },
					{ x: 100, y: 35, label: "U2", id: "user-2" },
					{ x: 160, y: 35, label: "U3", id: "user-3" },
				].map((user) => {
					const startX = 100;
					const startY = 90;

					return (
						<g key={user.id}>
							<line
								x1={startX}
								y1={startY}
								x2={user.x}
								y2={user.y}
								stroke="currentColor"
								strokeWidth="2"
								className="text-foreground/30"
								strokeDasharray="4,4"
							>
								<animate
									attributeName="stroke-dashoffset"
									from="0"
									to="8"
									dur="1.5s"
									repeatCount="indefinite"
								/>
							</line>
							<circle r="3" fill="currentColor" className="text-foreground">
								<animateMotion
									dur="2s"
									repeatCount="indefinite"
									begin={`${user.label === "U1" ? 0 : user.label === "U2" ? 0.3 : 0.6}s`}
								>
									<mpath href={`#path-${user.id}`} />
								</animateMotion>
							</circle>
							<path
								id={`path-${user.id}`}
								d={`M ${user.x} ${user.y} L ${startX} ${startY}`}
								fill="none"
								stroke="none"
							/>
							<rect
								x={user.x - 18}
								y={user.y - 15}
								width="36"
								height="30"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								className="text-border"
								rx="2"
							>
								<animate
									attributeName="opacity"
									values="0.5;1;0.5"
									dur="2s"
									begin={`${user.label === "U1" ? 0 : user.label === "U2" ? 0.3 : 0.6}s`}
									repeatCount="indefinite"
								/>
							</rect>
							<text
								x={user.x}
								y={user.y + 4}
								textAnchor="middle"
								className="fill-current font-bold font-mono text-[10px] text-foreground"
							>
								{user.label}
							</text>
						</g>
					);
				})}

				{/* Pixels below */}
				{[
					{ x: 40, y: 170, label: "FB", id: "pixel-fb" },
					{ x: 100, y: 170, label: "TIK", id: "pixel-tiktok" },
					{ x: 160, y: 170, label: "RDT", id: "pixel-reddit" },
				].map((pixel) => {
					const startX = 100;
					const startY = 125;

					return (
						<g key={pixel.id}>
							<line
								x1={startX}
								y1={startY}
								x2={pixel.x}
								y2={pixel.y}
								stroke="currentColor"
								strokeWidth="2"
								className="text-foreground/30"
								strokeDasharray="4,4"
							>
								<animate
									attributeName="stroke-dashoffset"
									from="0"
									to="8"
									dur="1.5s"
									repeatCount="indefinite"
								/>
							</line>
							<circle r="3" fill="currentColor" className="text-foreground">
								<animateMotion
									dur="2s"
									repeatCount="indefinite"
									begin={`${pixel.label === "FB" ? 0 : pixel.label === "TIK" ? 0.3 : 0.6}s`}
								>
									<mpath href={`#path-${pixel.id}`} />
								</animateMotion>
							</circle>
							<path
								id={`path-${pixel.id}`}
								d={`M ${startX} ${startY} L ${pixel.x} ${pixel.y}`}
								fill="none"
								stroke="none"
							/>
							<rect
								x={pixel.x - 18}
								y={pixel.y - 15}
								width="36"
								height="30"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.5"
								className="text-border"
								rx="2"
							>
								<animate
									attributeName="opacity"
									values="0.5;1;0.5"
									dur="2s"
									begin={`${pixel.label === "FB" ? 0 : pixel.label === "TIK" ? 0.3 : 0.6}s`}
									repeatCount="indefinite"
								/>
							</rect>
							<text
								x={pixel.x}
								y={pixel.y + 4}
								textAnchor="middle"
								className="fill-current font-bold font-mono text-[9px] text-foreground"
							>
								{pixel.label}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}

function BYOKIcon() {
	return (
		<div className="relative h-full w-full p-4">
			<svg
				className="h-full w-full"
				viewBox="0 0 200 200"
				role="img"
				aria-label="Privacy and security"
			>
				<defs>
					<pattern
						id="grid-byok"
						width="20"
						height="20"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 20 0 L 0 0 0 20"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							className="text-border"
						/>
					</pattern>
				</defs>
				<rect width="200" height="200" fill="url(#grid-byok)" opacity="0.3" />

				<rect
					x="70"
					y="95"
					width="60"
					height="60"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					className="text-foreground"
				/>

				<path
					d="M 82 95 L 82 75 Q 82 60, 100 60 Q 118 60, 118 75 L 118 95"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					className="text-foreground"
				/>

				<circle
					cx="100"
					cy="118"
					r="7"
					fill="currentColor"
					className="text-foreground"
				>
					<animate
						attributeName="opacity"
						values="0.5;1;0.5"
						dur="2s"
						repeatCount="indefinite"
					/>
				</circle>
				<rect
					x="96"
					y="125"
					width="8"
					height="16"
					fill="currentColor"
					className="text-foreground"
				>
					<animate
						attributeName="opacity"
						values="0.5;1;0.5"
						dur="2s"
						repeatCount="indefinite"
					/>
				</rect>

				{[1, 2, 3].map((i) => (
					<circle
						key={i}
						cx="100"
						cy="125"
						r={35 + i * 18}
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="text-foreground/30"
						strokeDasharray="6,6"
					>
						<animate
							attributeName="r"
							values={`${35 + i * 18};${50 + i * 18};${35 + i * 18}`}
							dur="4s"
							begin={`${i * 0.5}s`}
							repeatCount="indefinite"
						/>
						<animate
							attributeName="opacity"
							values="0;0.6;0"
							dur="4s"
							begin={`${i * 0.5}s`}
							repeatCount="indefinite"
						/>
					</circle>
				))}

				<path
					d="M 55 55 L 45 55 L 45 65"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					className="text-border"
				/>
				<path
					d="M 145 55 L 155 55 L 155 65"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					className="text-border"
				/>
				<path
					d="M 55 170 L 45 170 L 45 160"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					className="text-border"
				/>
				<path
					d="M 145 170 L 155 170 L 155 160"
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					className="text-border"
				/>
			</svg>
		</div>
	);
}

function CampaignManagementIcon() {
	return (
		<div className="relative h-full w-full p-4">
			<svg
				className="h-full w-full"
				viewBox="0 0 200 200"
				role="img"
				aria-label="Campaign management with multiple pixels"
			>
				<defs>
					<pattern
						id="grid-campaign"
						width="20"
						height="20"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 20 0 L 0 0 0 20"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							className="text-border"
						/>
					</pattern>
				</defs>
				<rect
					width="200"
					height="200"
					fill="url(#grid-campaign)"
					opacity="0.3"
				/>

				{/* Three campaigns on the left */}
				{[
					{ y: 35, label: "C1", id: "campaign-1", delay: 0 },
					{ y: 100, label: "C2", id: "campaign-2", delay: 0.4 },
					{ y: 165, label: "C3", id: "campaign-3", delay: 0.8 },
				].map((campaign) => (
					<g key={campaign.id}>
						<rect
							x="15"
							y={campaign.y - 15}
							width="40"
							height="30"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							className="text-foreground"
							rx="2"
						>
							<animate
								attributeName="opacity"
								values="0.6;1;0.6"
								dur="3s"
								begin={`${campaign.delay}s`}
								repeatCount="indefinite"
							/>
						</rect>
						<text
							x="35"
							y={campaign.y + 4}
							textAnchor="middle"
							className="fill-current font-bold font-mono text-[10px] text-foreground"
						>
							{campaign.label}
						</text>
					</g>
				))}

				{/* Pixels on the right */}
				{[
					{ y: 50, label: "FB", id: "pixel-fb", color: "text-foreground" },
					{ y: 100, label: "TIK", id: "pixel-tik", color: "text-foreground" },
					{ y: 150, label: "RDT", id: "pixel-rdt", color: "text-foreground" },
				].map((pixel) => (
					<g key={pixel.id}>
						<rect
							x="145"
							y={pixel.y - 15}
							width="40"
							height="30"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							className="text-border"
							rx="2"
						>
							<animate
								attributeName="opacity"
								values="0.5;1;0.5"
								dur="2.5s"
								begin={`${pixel.y / 100}s`}
								repeatCount="indefinite"
							/>
						</rect>
						<text
							x="165"
							y={pixel.y + 4}
							textAnchor="middle"
							className={`fill-current font-bold font-mono text-[9px] ${pixel.color}`}
						>
							{pixel.label}
						</text>
					</g>
				))}

				{/* Connection lines from campaigns to pixels with animated particles */}
				{/* C1 to FB and TIK */}
				<line
					x1="55"
					y1="35"
					x2="145"
					y2="50"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="6"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</line>
				<circle r="2.5" fill="currentColor" className="text-foreground">
					<animateMotion dur="2.5s" repeatCount="indefinite" begin="0s">
						<mpath href="#path-c1-fb" />
					</animateMotion>
				</circle>
				<path id="path-c1-fb" d="M 55 35 L 145 50" fill="none" stroke="none" />

				<line
					x1="55"
					y1="35"
					x2="145"
					y2="100"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="6"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</line>
				<circle r="2.5" fill="currentColor" className="text-foreground">
					<animateMotion dur="3s" repeatCount="indefinite" begin="0.3s">
						<mpath href="#path-c1-tik" />
					</animateMotion>
				</circle>
				<path
					id="path-c1-tik"
					d="M 55 35 L 145 100"
					fill="none"
					stroke="none"
				/>

				{/* C2 to all three pixels */}
				<line
					x1="55"
					y1="100"
					x2="145"
					y2="50"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="6"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</line>
				<circle r="2.5" fill="currentColor" className="text-foreground">
					<animateMotion dur="2.8s" repeatCount="indefinite" begin="0.4s">
						<mpath href="#path-c2-fb" />
					</animateMotion>
				</circle>
				<path id="path-c2-fb" d="M 55 100 L 145 50" fill="none" stroke="none" />

				<line
					x1="55"
					y1="100"
					x2="145"
					y2="100"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="6"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</line>
				<circle r="2.5" fill="currentColor" className="text-foreground">
					<animateMotion dur="2.2s" repeatCount="indefinite" begin="0.6s">
						<mpath href="#path-c2-tik" />
					</animateMotion>
				</circle>
				<path
					id="path-c2-tik"
					d="M 55 100 L 145 100"
					fill="none"
					stroke="none"
				/>

				<line
					x1="55"
					y1="100"
					x2="145"
					y2="150"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="6"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</line>
				<circle r="2.5" fill="currentColor" className="text-foreground">
					<animateMotion dur="3.2s" repeatCount="indefinite" begin="0.8s">
						<mpath href="#path-c2-rdt" />
					</animateMotion>
				</circle>
				<path
					id="path-c2-rdt"
					d="M 55 100 L 145 150"
					fill="none"
					stroke="none"
				/>

				{/* C3 to TIK and RDT */}
				<line
					x1="55"
					y1="165"
					x2="145"
					y2="100"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="6"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</line>
				<circle r="2.5" fill="currentColor" className="text-foreground">
					<animateMotion dur="2.6s" repeatCount="indefinite" begin="1s">
						<mpath href="#path-c3-tik" />
					</animateMotion>
				</circle>
				<path
					id="path-c3-tik"
					d="M 55 165 L 145 100"
					fill="none"
					stroke="none"
				/>

				<line
					x1="55"
					y1="165"
					x2="145"
					y2="150"
					stroke="currentColor"
					strokeWidth="1.5"
					className="text-foreground/20"
					strokeDasharray="3,3"
				>
					<animate
						attributeName="stroke-dashoffset"
						from="0"
						to="6"
						dur="1.5s"
						repeatCount="indefinite"
					/>
				</line>
				<circle r="2.5" fill="currentColor" className="text-foreground">
					<animateMotion dur="2.4s" repeatCount="indefinite" begin="1.2s">
						<mpath href="#path-c3-rdt" />
					</animateMotion>
				</circle>
				<path
					id="path-c3-rdt"
					d="M 55 165 L 145 150"
					fill="none"
					stroke="none"
				/>

				{/* Analytics bars floating above pixels showing results */}
				{[
					{ x: 165, y: 35, height: 8, delay: "0s", id: "analytics-fb" },
					{ x: 165, y: 85, height: 12, delay: "0.3s", id: "analytics-tik" },
					{ x: 165, y: 135, height: 6, delay: "0.6s", id: "analytics-rdt" },
				].map((bar) => (
					<rect
						key={bar.id}
						x={bar.x}
						y={bar.y}
						width="6"
						height={bar.height}
						fill="currentColor"
						className="text-foreground/60"
						rx="1"
					>
						<animate
							attributeName="height"
							values={`${bar.height};${bar.height + 4};${bar.height}`}
							dur="2s"
							begin={bar.delay}
							repeatCount="indefinite"
						/>
						<animate
							attributeName="opacity"
							values="0.4;1;0.4"
							dur="2s"
							begin={bar.delay}
							repeatCount="indefinite"
						/>
					</rect>
				))}
			</svg>
		</div>
	);
}

export function LandingPage() {
	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-12">
			{/* Hero Section */}
			<section className="mb-24">
				<div className="mb-8 border-foreground border-l-2 pl-4">
					<h1 className="mb-4 font-bold text-6xl tracking-tight">TRAKI</h1>
					<p className="max-w-2xl text-muted-foreground text-xl leading-relaxed">
						Event tracking infrastructure for modern marketing teams.
						<br />
						Track, analyze, and optimize campaigns with edge computing.
					</p>
				</div>
			</section>

			{/* Animated Features Section */}
			<section className="mb-24">
				<div className="mx-auto w-full max-w-6xl">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{/* Linha de cima */}
						<AnimatedFeatureCard
							icon={<MultiModelIcon />}
							title="Multi-Platform"
							description="Support for Reddit, TikTok, Pinterest, Facebook, and Kwai."
						/>
						<AnimatedFeatureCard
							icon={<MCPIcon />}
							title="Real-time Global Tracking"
							description="Stream events and conversions in real-time to your dashboard."
						/>
						<AnimatedFeatureCard
							icon={<CampaignManagementIcon />}
							title="Campaign Management"
							description="Organize campaigns with different pixel configurations and track results across social networks."
						/>
						{/* Linha de baixo */}
						<AnimatedFeatureCard
							icon={<EdgeComputingIcon />}
							title="Edge Computing"
							description="Distributed infrastructure with ultra-low latency across multiple global locations."
						/>
						<AnimatedFeatureCard
							icon={<DataReplicationIcon />}
							title="Data Replication"
							description="Replicate events to multiple pixels: Facebook, TikTok, and Reddit."
						/>
						<AnimatedFeatureCard
							icon={<BYOKIcon />}
							title="Privacy First"
							description="Full control over your data with secure API integrations."
						/>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
