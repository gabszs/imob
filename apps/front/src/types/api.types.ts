/**
 * Type definitions for HDS Group Backend API
 * Auto-generated from backend analysis
 */

// Branded types for type safety
type BrandedString<T extends string> = string & { __brand: T };
type BrandedNumber<T extends string> = number & { __brand: T };

// ============================================
// Authentication & User Types
// ============================================

export interface User {
	id: number;
	username?: string;
	email: string;
	name?: string;
	created_at?: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginByUsernameRequest {
	username: string;
	password: string;
}

export interface RegisterRequest {
	username: string;
	password: string;
	email?: string;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export interface VerifyTokenResponse {
	user: User;
}

// ============================================
// Facebook Types
// ============================================

export interface FacebookProfile {
	id: string;
	name: string;
	email: string;
	picture: {
		data: {
			url: string;
			height: number;
			width: number;
		};
	};
	timezone?: string;
	locale?: string;
}

export interface FacebookUser {
	id: string;
	name: string;
	email?: string;
}

export interface FacebookStatusResponse {
	connected: boolean;
	user?: FacebookUser;
	error?: string;
}

export interface FacebookDisconnectResponse {
	success: boolean;
	message: string;
}

export interface FacebookReconnectResponse {
	success: boolean;
	auth_url: string;
	message: string;
}

// ============================================
// Facebook Business & Ad Accounts
// ============================================

export interface BusinessAccount {
	id: string;
	name: string;
	verification_status?: string;
	profile_picture_uri?: string;
	timezone_id?: string;
}

export interface BusinessAccountsResponse {
	data: BusinessAccount[];
}

export interface AdAccount {
	id: string;
	name: string;
	account_status: number;
	currency: string;
	timezone_name?: string;
	business?: {
		id: string;
		name: string;
	};
	spend_cap?: string;
	amount_spent?: string;
	balance?: string;
	source?: "direct" | "business_owned" | "business_client";
	business_name?: string;
	today_spend?: number;
	period_spend?: number;
}

export interface AdAccountsResponse {
	data: AdAccount[];
	paging?: {
		cursors?: {
			before?: string;
			after?: string;
		};
		next?: string;
		previous?: string;
	};
	summary?: {
		total_count: number;
		sources: {
			direct?: number;
			business_owned?: number;
			business_client?: number;
		};
	};
}

export interface AdAccountDebugResponse {
	summary: {
		total_accounts: number;
		by_status: Record<string, number>;
		by_source: Record<string, number>;
	};
	accounts_by_source: {
		direct?: AdAccount[];
		business_owned?: AdAccount[];
		business_client?: AdAccount[];
	};
	business_groups?: Record<string, any>;
	total_unique_accounts: number;
	execution_info: {
		duration_ms: number;
		timestamp: string;
	};
}

// ============================================
// Facebook Campaigns, AdSets, Ads
// ============================================

export interface Campaign {
	id: string;
	name: string;
	status: string;
	objective?: string;
	created_time?: string;
	updated_time?: string;
	start_time?: string;
	stop_time?: string;
	daily_budget?: string;
	lifetime_budget?: string;
	budget_remaining?: string;
	bid_strategy?: string;
	attribution_spec?: any[];
}

export interface CampaignsResponse {
	data: Campaign[];
}

export interface AdSet {
	id: string;
	name: string;
	status: string;
	created_time?: string;
	updated_time?: string;
	start_time?: string;
	end_time?: string;
	daily_budget?: string;
	lifetime_budget?: string;
	budget_remaining?: string;
	targeting?: any;
}

export interface AdSetsResponse {
	data: AdSet[];
}

export interface Ad {
	id: string;
	name: string;
	status: string;
	created_time?: string;
	updated_time?: string;
	creative?: any;
}

export interface AdsResponse {
	data: Ad[];
}

// ============================================
// Facebook Pixels & Insights
// ============================================

export interface Pixel {
	id: string;
	name: string;
	creation_time?: string;
	last_fired_time?: string;
	code?: string;
}

export interface PixelsResponse {
	data: Pixel[];
}

export interface Insight {
	impressions?: number;
	clicks?: number;
	spend?: number;
	reach?: number;
	frequency?: number;
	cpm?: number;
	cpc?: number;
	ctr?: number;
	cost_per_result?: number;
	results?: number;
	inline_link_clicks?: number;
	inline_link_click_ctr?: number;
	date_start?: string;
	date_stop?: string;
}

export interface InsightsResponse {
	data: Insight[];
	paging?: {
		cursors?: {
			before?: string;
			after?: string;
		};
		next?: string;
		previous?: string;
	};
}

// ============================================
// Facebook Pages
// ============================================

export interface FacebookPage {
	id: string;
	name: string;
	category?: string;
	access_token?: string;
	tasks?: string[];
	fan_count?: number;
	followers_count?: number;
	about?: string;
	description?: string;
	website?: string;
	phone?: string;
	emails?: string[];
	location?: any;
	cover?: any;
	picture?: any;
}

export interface FacebookPagesResponse {
	data: FacebookPage[];
}

export interface FacebookPost {
	id: string;
	message?: string;
	created_time: string;
	updated_time?: string;
	story?: string;
	from?: {
		id: string;
		name: string;
	};
	permalink_url?: string;
	shares?: {
		count: number;
	};
	likes?: {
		summary: {
			total_count: number;
		};
	};
	comments?: {
		summary: {
			total_count: number;
		};
	};
}

export interface FacebookPostsResponse {
	data: FacebookPost[];
	paging?: {
		cursors?: {
			before?: string;
			after?: string;
		};
		next?: string;
		previous?: string;
	};
}

export interface CreatePostRequest {
	message?: string;
	link?: string;
	picture?: string;
	name?: string;
	caption?: string;
	description?: string;
	published?: boolean;
}

export interface CreatePostResponse {
	id: string;
}

export interface PageInsight {
	name: string;
	period: string;
	values: Array<{
		value: number;
		end_time: string;
	}>;
	title?: string;
	description?: string;
	id: string;
}

export interface PageInsightsResponse {
	data: PageInsight[];
}

// ============================================
// Facebook Comments
// ============================================

export interface Comment {
	id: string;
	message: string;
	created_time: string;
	from: {
		id: string;
		name: string;
	};
	like_count?: number;
	comment_count?: number;
	user_likes?: boolean;
	attachment?: any;
	parent?: {
		id: string;
	};
}

export interface CommentsResponse {
	data: Comment[];
}

export interface CreateCommentRequest {
	message: string;
}

export interface CreateCommentResponse {
	id: string;
}

export interface DeleteCommentResponse {
	success: boolean;
}

// ============================================
// Facebook Call-to-Action (CTA)
// ============================================

export interface CTA {
	id: string;
	type: string;
	status?: string;
	created_time?: string;
	updated_time?: string;
	web_url?: string;
	phone_number?: string;
	email_address?: string;
	intl_number_with_plus?: string;
}

export interface CTAsResponse {
	data: CTA[];
}

export interface CreateCTARequest {
	type: string;
	web_url?: string;
	phone_number?: string;
	email_address?: string;
}

export interface CreateCTAResponse {
	id: string;
}

export interface DeleteCTAResponse {
	success: boolean;
}

// ============================================
// Facebook Messenger
// ============================================

export interface Conversation {
	id: string;
	snippet?: string;
	updated_time: string;
	message_count?: number;
	unread_count?: number;
	participants?: any;
	senders?: any;
	can_reply?: boolean;
	is_subscribed?: boolean;
}

export interface ConversationsResponse {
	data: Conversation[];
}

export interface Message {
	id: string;
	message?: string;
	from: {
		id: string;
		name: string;
		email?: string;
	};
	to?: {
		data: Array<{
			id: string;
			name: string;
			email?: string;
		}>;
	};
	created_time: string;
	attachments?: any[];
	sticker?: any;
	tags?: any;
}

export interface MessagesResponse {
	data: Message[];
}

export interface SendMessageRequest {
	recipient_id: string;
	message_text?: string;
	attachment_url?: string;
	attachment_type?: string;
}

// ============================================
// Facebook Events
// ============================================

export interface SendEventRequest {
	event_name: string;
	event_data?: any;
	test_event_code?: string;
}

// ============================================
// Facebook Dashboard
// ============================================

export interface DashboardResponse {
	profile: FacebookProfile;
	businesses: BusinessAccount[];
	adAccounts: AdAccount[];
	recentCampaigns: Campaign[];
	businessError?: string;
	adAccountsError?: string;
	campaignsError?: string;
}

// ============================================
// Pixel Configurations
// ============================================

export interface PixelConfig {
	id: number;
	name: string;
	pixelId: string;
	accessToken: string;
	createdAt?: string;
}

export interface CreatePixelConfigRequest {
	name: string;
	pixelId: string;
	accessToken: string;
}

export interface UpdatePixelConfigRequest {
	name: string;
	pixelId: string;
	accessToken: string;
}

export interface FacebookConfig {
	id: number;
	name: string;
	pixelId: string;
	accessToken: string;
	testEventCode?: string;
	appId?: string;
	externalId?: string;
	createdAt?: string;
}

export interface CreateFacebookConfigRequest {
	name: string;
	pixelId: string;
	accessToken: string;
	testEventCode?: string;
	appId?: string;
	externalId?: string;
}

export interface UpdateFacebookConfigRequest {
	name: string;
	pixelId: string;
	accessToken: string;
	testEventCode?: string;
	appId?: string;
	externalId?: string;
}

// ============================================
// Event Logs
// ============================================

export interface EventLog {
	id: number;
	pixelId: string;
	eventType: string;
	kwaiClickId: string;
	timestamp: string;
	actionParams?: any;
	status: "success" | "failed";
	errorMessage?: string;
}

export interface FacebookEventLog {
	id: number;
	pixelId: string;
	eventName: string;
	eventTime: number;
	status: "success" | "failed";
	payload?: any;
	response?: any;
	errorMessage?: string;
	createdAt: string;
}

// ============================================
// Tracking Events
// ============================================

export interface FacebookTrackRequest {
	pixel_id: string;
	event_name: string;
	event_time?: number;
	user_data: {
		em?: string;
		ph?: string;
		client_ip_address?: string;
		client_user_agent?: string;
		fbc?: string;
		fbp?: string;
	};
	custom_data?: any;
}

export interface FacebookTrackResponse {
	success: boolean;
	data: any;
}

export interface KwaiTrackRequest {
	pixel_id: string;
	event_type: string;
	kwai_click_id: string;
	action_params?: any;
}

export interface KwaiTrackResponse {
	success: boolean;
	data: any;
}

// ============================================
// JoinAds / Domain Accounts
// ============================================

export type AccountId = BrandedString<"AccountId">;
export type DomainName = BrandedString<"DomainName">;

export interface DomainAccountsData {
	domainAdAccounts: { [domainName in DomainName]?: AccountId[] };
	domainCosts: Record<string, any>;
}

export interface SaveDomainAccountsRequest {
	domainAdAccounts: Record<string, any>;
	domainCosts: Record<string, any>;
}

export interface SaveDomainAccountsResponse {
	success: boolean;
	message: string;
}

// ============================================
// JoinAds Earnings
// ============================================

export interface EarningsRequest {
	start_date: string; // YYYY-MM-DD
	end_date: string; // YYYY-MM-DD
}

export interface EarningsData {
	topDomains?: Array<{
		domain: string;
		revenue: number;
		revenue_client?: number;
		impressions: number;
		clicks: number;
	}>;
}

export interface EarningsResponse {
	success: boolean;
	data: EarningsData;
	payload_sent?: any;
}

// ============================================
// JoinAds Main Filter
// ============================================

export interface MainFilterRequest {
	start: string; // YYYY-MM-DD
	end: string; // YYYY-MM-DD
	domain: string[];
}

export interface MainFilterResponse {
	success: boolean;
	data: any;
}

// ============================================
// JoinAds Advertiser Campaign Report
// ============================================

export interface AdvertiserCampaignReportParams {
	start_date: string; // YYYY-MM-DD
	end_date: string; // YYYY-MM-DD
	domain?: string;
	utm_campaign?: string;
}

// ============================================
// Debug Endpoints
// ============================================

export interface FacebookTokenDebugResponse {
	status: string;
	message: string;
	token_info?: any;
	profile?: FacebookProfile;
	error?: any;
}

export interface JWTDebugResponse {
	status: string;
	message: string;
	user?: any;
	exp?: string;
	iat?: string;
	error?: string;
}

export interface DatabaseQueryRequest {
	query: string;
	params?: any[];
}

export interface DatabaseQueryResponse {
	success: boolean;
	query: string;
	params: any[];
	result: any[];
	count: number;
	executed_at: string;
	executed_by: string;
}

export interface DatabaseSchemaResponse {
	success: boolean;
	tables: string[];
	schema: Record<string, any>;
	database_file: string;
}

// ============================================
// HispanoAds Statistics
// ============================================

export interface HispanoAdsStatistic {
	networkCode: string;
	date: string; // ISO 8601 date string
	site?: string;
	revenue: number;
	impressions: number;
	clicks: number;
	cpmAverage: number;
	viewability: number;
	ctr: number;
}

export interface HispanoAdsStatisticsRequest {
	days?: number; // Default 30
	revenueShare?: number; // Default 0, percentage 0-100
	startDate?: string;
	endDate?: string;
}

export interface HispanoAdsStatisticsResponse {
	success: boolean;
	data: HispanoAdsStatistic[];
}

// ============================================
// Health & Status
// ============================================

export interface HealthResponse {
	status: string;
	timestamp?: string;
	uptime?: number;
}

export interface TestResponse {
	message: string;
	success?: boolean;
	data?: any;
	count?: number;
	test_info?: any;
}

// ============================================
// Generic API Response
// ============================================

export interface ApiError {
	message: string;
	error?: any;
	status?: number;
}

export interface ApiResponse<T = any> {
	data?: T;
	success?: boolean;
	message?: string;
	error?: string;
}
