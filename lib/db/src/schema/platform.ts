import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    email: text("email"),
    status: text("status").notNull().default("active"),
    ...timestamps,
  },
  (table) => [index("users_status_idx").on(table.status)],
);

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  locale: text("locale").notNull().default("en"),
  bio: text("bio"),
  ...timestamps,
});

export const rolesTable = pgTable("roles", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamps.createdAt,
});

export const userRolesTable = pgTable(
  "user_roles",
  {
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    roleId: integer("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const seriesTable = pgTable(
  "series",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    ageRating: text("age_rating").notNull().default("13+"),
    releaseYear: integer("release_year"),
    coverMediaId: integer("cover_media_id"),
    status: text("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    ...timestamps,
  },
  (table) => [index("series_status_idx").on(table.status), index("series_featured_idx").on(table.featured)],
);

export const genresTable = pgTable("genres", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  ...timestamps,
});

export const seriesGenresTable = pgTable(
  "series_genres",
  {
    seriesId: integer("series_id").notNull().references(() => seriesTable.id, { onDelete: "cascade" }),
    genreId: integer("genre_id").notNull().references(() => genresTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.seriesId, table.genreId] })],
);

export const episodesTable = pgTable(
  "episodes",
  {
    id: serial("id").primaryKey(),
    seriesId: integer("series_id").notNull().references(() => seriesTable.id, { onDelete: "cascade" }),
    episodeNumber: integer("episode_number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: text("status").notNull().default("draft"),
    accessType: text("access_type").notNull().default("free"),
    coinPrice: integer("coin_price").notNull().default(0),
    videoMediaId: integer("video_media_id"),
    thumbnailMediaId: integer("thumbnail_media_id"),
    durationSeconds: integer("duration_seconds"),
    ...timestamps,
  },
  (table) => [
    unique("episodes_series_number_unique").on(table.seriesId, table.episodeNumber),
    index("episodes_series_idx").on(table.seriesId),
    index("episodes_status_idx").on(table.status),
  ],
);

export const charactersTable = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  avatarMediaId: integer("avatar_media_id"),
  ...timestamps,
});

export const seriesCharactersTable = pgTable(
  "series_characters",
  {
    seriesId: integer("series_id").notNull().references(() => seriesTable.id, { onDelete: "cascade" }),
    characterId: integer("character_id").notNull().references(() => charactersTable.id, { onDelete: "cascade" }),
    roleName: text("role_name"),
  },
  (table) => [primaryKey({ columns: [table.seriesId, table.characterId] })],
);

export const mediaAssetsTable = pgTable(
  "media_assets",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(),
    provider: text("provider").notNull().default("object_storage"),
    objectPath: text("object_path"),
    sourceUrl: text("source_url"),
    mimeType: text("mime_type"),
    fileName: text("file_name"),
    sizeBytes: integer("size_bytes"),
    durationSeconds: integer("duration_seconds"),
    width: integer("width"),
    height: integer("height"),
    resolution: text("resolution"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ...timestamps,
  },
  (table) => [index("media_assets_kind_idx").on(table.kind), index("media_assets_provider_idx").on(table.provider)],
);

export const watchHistoryTable = pgTable(
  "watch_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    episodeId: integer("episode_id").notNull().references(() => episodesTable.id, { onDelete: "cascade" }),
    watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
    completed: boolean("completed").notNull().default(false),
  },
  (table) => [index("watch_history_user_idx").on(table.userId, table.watchedAt), unique("watch_history_user_episode_unique").on(table.userId, table.episodeId)],
);

export const watchProgressTable = pgTable(
  "watch_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    episodeId: integer("episode_id").notNull().references(() => episodesTable.id, { onDelete: "cascade" }),
    positionSeconds: integer("position_seconds").notNull().default(0),
    durationSeconds: integer("duration_seconds"),
    completed: boolean("completed").notNull().default(false),
    ...timestamps,
  },
  (table) => [unique("watch_progress_user_episode_unique").on(table.userId, table.episodeId), index("watch_progress_user_idx").on(table.userId, table.updatedAt)],
);

export const favoritesTable = pgTable(
  "favorites",
  {
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    seriesId: integer("series_id").notNull().references(() => seriesTable.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.seriesId] })],
);

export const followingTable = pgTable(
  "following",
  {
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    seriesId: integer("series_id").notNull().references(() => seriesTable.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.seriesId] })],
);

export const episodeUnlocksTable = pgTable(
  "episode_unlocks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    episodeId: integer("episode_id").notNull().references(() => episodesTable.id, { onDelete: "cascade" }),
    coinTransactionId: integer("coin_transaction_id"),
    unlockedAt: timestamps.createdAt,
  },
  (table) => [unique("episode_unlock_user_episode_unique").on(table.userId, table.episodeId), index("episode_unlock_user_idx").on(table.userId)],
);

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  coinBalance: integer("coin_balance").notNull().default(0),
  bonusBalance: integer("bonus_balance").notNull().default(0),
  ...timestamps,
});

export const coinTransactionsTable = pgTable(
  "coin_transactions",
  {
    id: serial("id").primaryKey(),
    walletId: integer("wallet_id").notNull().references(() => walletsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    coinDelta: integer("coin_delta").notNull(),
    bonusDelta: integer("bonus_delta").notNull().default(0),
    balanceAfter: integer("balance_after").notNull(),
    bonusAfter: integer("bonus_after").notNull(),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamps.createdAt,
  },
  (table) => [index("coin_transactions_user_idx").on(table.userId, table.createdAt), index("coin_transactions_type_idx").on(table.type)],
);

export const coinPackagesTable = pgTable("coin_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  coinAmount: integer("coin_amount").notNull(),
  bonusAmount: integer("bonus_amount").notNull().default(0),
  priceMinor: integer("price_minor").notNull(),
  currency: text("currency").notNull().default("USD"),
  providerProductId: text("provider_product_id"),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const vipPlansTable = pgTable("vip_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  interval: text("interval").notNull(),
  priceMinor: integer("price_minor").notNull(),
  currency: text("currency").notNull().default("USD"),
  providerPriceId: text("provider_price_id"),
  active: boolean("active").notNull().default(true),
  benefits: jsonb("benefits").$type<string[]>().notNull().default([]),
  ...timestamps,
});

export const subscriptionsTable = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    vipPlanId: integer("vip_plan_id").notNull().references(() => vipPlansTable.id),
    provider: text("provider").notNull(),
    providerSubscriptionId: text("provider_subscription_id"),
    status: text("status").notNull().default("pending"),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("subscriptions_user_idx").on(table.userId), index("subscriptions_status_idx").on(table.status)],
);

export const subscriptionEventsTable = pgTable(
  "subscription_events",
  {
    id: serial("id").primaryKey(),
    subscriptionId: integer("subscription_id").references(() => subscriptionsTable.id, { onDelete: "set null" }),
    provider: text("provider").notNull(),
    providerEventId: text("provider_event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    receivedAt: timestamps.createdAt,
  },
  (table) => [index("subscription_events_type_idx").on(table.eventType)],
);

export const paymentTransactionsTable = pgTable(
  "payment_transactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerPaymentId: text("provider_payment_id"),
    kind: text("kind").notNull(),
    status: text("status").notNull().default("pending"),
    amountMinor: integer("amount_minor").notNull(),
    currency: text("currency").notNull().default("USD"),
    coinPackageId: integer("coin_package_id").references(() => coinPackagesTable.id),
    vipPlanId: integer("vip_plan_id").references(() => vipPlansTable.id),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ...timestamps,
  },
  (table) => [index("payment_transactions_user_idx").on(table.userId), index("payment_transactions_status_idx").on(table.status)],
);

export const paymentWebhookEventsTable = pgTable(
  "payment_webhook_events",
  {
    id: serial("id").primaryKey(),
    provider: text("provider").notNull(),
    providerEventId: text("provider_event_id").notNull(),
    eventType: text("event_type").notNull(),
    signatureVerified: boolean("signature_verified").notNull().default(false),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamps.createdAt,
  },
  (table) => [unique("payment_webhook_provider_event_unique").on(table.provider, table.providerEventId)],
);

export const rewardsTable = pgTable("rewards", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  coinAmount: integer("coin_amount").notNull().default(0),
  bonusAmount: integer("bonus_amount").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const rewardClaimsTable = pgTable(
  "reward_claims",
  {
    id: serial("id").primaryKey(),
    rewardId: integer("reward_id").notNull().references(() => rewardsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    coinTransactionId: integer("coin_transaction_id"),
    claimedAt: timestamps.createdAt,
  },
  (table) => [unique("reward_claim_user_reward_unique").on(table.rewardId, table.userId), index("reward_claim_user_idx").on(table.userId)],
);

export const missionsTable = pgTable("missions", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  target: integer("target").notNull(),
  rewardId: integer("reward_id").references(() => rewardsTable.id),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const missionProgressTable = pgTable(
  "mission_progress",
  {
    id: serial("id").primaryKey(),
    missionId: integer("mission_id").notNull().references(() => missionsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    progress: integer("progress").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [unique("mission_progress_user_mission_unique").on(table.userId, table.missionId)],
);

export const notificationsTable = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("notifications_user_read_idx").on(table.userId, table.readAt)],
);

export const reviewsTable = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    seriesId: integer("series_id").notNull().references(() => seriesTable.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: text("status").notNull().default("published"),
    ...timestamps,
  },
  (table) => [unique("review_user_series_unique").on(table.userId, table.seriesId)],
);

export const ratingsTable = pgTable(
  "ratings",
  {
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    seriesId: integer("series_id").notNull().references(() => seriesTable.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.seriesId] }), index("ratings_series_idx").on(table.seriesId)],
);

export const languagesTable = pgTable("languages", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
});

export const translationsTable = pgTable(
  "translations",
  {
    id: serial("id").primaryKey(),
    languageCode: text("language_code").notNull().references(() => languagesTable.code),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id").notNull(),
    field: text("field").notNull(),
    value: text("value").notNull(),
    ...timestamps,
  },
  (table) => [unique("translation_entity_language_field_unique").on(table.languageCode, table.entityType, table.entityId, table.field), index("translations_entity_idx").on(table.entityType, table.entityId)],
);

export const subtitlesTable = pgTable(
  "subtitles",
  {
    id: serial("id").primaryKey(),
    episodeId: integer("episode_id").notNull().references(() => episodesTable.id, { onDelete: "cascade" }),
    languageCode: text("language_code").notNull().references(() => languagesTable.code),
    mediaId: integer("media_id").references(() => mediaAssetsTable.id),
    cues: jsonb("cues").$type<Array<{ start: number; end: number; text: string }>>().notNull().default([]),
    ...timestamps,
  },
  (table) => [unique("subtitle_episode_language_unique").on(table.episodeId, table.languageCode)],
);

export const rewardedAdEventsTable = pgTable(
  "rewarded_ad_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerEventId: text("provider_event_id"),
    status: text("status").notNull().default("unavailable"),
    rewardId: integer("reward_id").references(() => rewardsTable.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamps.createdAt,
  },
  (table) => [index("rewarded_ad_user_idx").on(table.userId, table.createdAt)],
);

export const analyticsEventsTable = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    path: text("path"),
    properties: jsonb("properties").$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("analytics_events_name_idx").on(table.name), index("analytics_events_occurred_idx").on(table.occurredAt), index("analytics_events_user_idx").on(table.userId)],
);

export const adminLogsTable = pgTable(
  "admin_logs",
  {
    id: serial("id").primaryKey(),
    adminUserId: integer("admin_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamps.createdAt,
  },
  (table) => [index("admin_logs_entity_idx").on(table.entityType, table.entityId), index("admin_logs_created_idx").on(table.createdAt)],
);

export const aiVideoJobsTable = pgTable(
  "ai_video_jobs",
  {
    id: serial("id").primaryKey(),
    requestedByUserId: integer("requested_by_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    provider: text("provider").notNull(),
    status: text("status").notNull().default("pending"),
    prompt: text("prompt").notNull(),
    providerJobId: text("provider_job_id"),
    resultMediaId: integer("result_media_id").references(() => mediaAssetsTable.id),
    error: text("error"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ...timestamps,
  },
  (table) => [index("ai_video_jobs_status_idx").on(table.status)],
);