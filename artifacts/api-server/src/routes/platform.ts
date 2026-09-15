import { Router, type IRouter } from "express";
import { z } from "zod";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, analyticsEventsTable, adminLogsTable, coinTransactionsTable, episodesTable, favoritesTable, followingTable, genresTable, missionProgressTable, missionsTable, notificationsTable, paymentTransactionsTable, profilesTable, rewardClaimsTable, rewardsTable, seriesGenresTable, seriesTable, subscriptionsTable, usersTable, vipPlansTable, walletsTable, watchHistoryTable, watchProgressTable } from "@workspace/db";
import { ensureLocalUser, getAuth, requireAdmin, requireAuth } from "../lib/auth";

const router: IRouter = Router();

const progressBody = z.object({
  episodeId: z.number().int().positive(),
  positionSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().positive().optional(),
  completed: z.boolean().optional(),
});

const listBody = z.object({ seriesId: z.union([z.number().int().positive(), z.string().min(1)]) });

const resolveSeriesId = async (value: number | string) => {
  if (typeof value === "number" || /^\d+$/.test(value)) return Number(value);
  const [series] = await db.select({ id: seriesTable.id }).from(seriesTable).where(eq(seriesTable.slug, value));
  return series?.id;
};

router.get("/me", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, user.id));
  const [wallet] = await db.select({ coinBalance: walletsTable.coinBalance, bonusBalance: walletsTable.bonusBalance }).from(walletsTable).where(eq(walletsTable.userId, user.id));
  return res.json({ user, profile, wallet });
});

router.get("/catalog/series", async (_req, res) => {
  const series = await db.select().from(seriesTable).where(eq(seriesTable.status, "published")).orderBy(desc(seriesTable.featured), desc(seriesTable.createdAt));
  const ids = series.map((item) => item.id);
  const genreRows = ids.length ? await db.select({ seriesId: seriesGenresTable.seriesId, slug: genresTable.slug, name: genresTable.name }).from(seriesGenresTable).innerJoin(genresTable, eq(genresTable.id, seriesGenresTable.genreId)).where(inArray(seriesGenresTable.seriesId, ids)) : [];
  return res.json(series.map((item) => ({ ...item, genres: genreRows.filter((genre) => genre.seriesId === item.id) })));
});

router.get("/catalog/series/:slug", async (req, res) => {
  const [series] = await db.select().from(seriesTable).where(eq(seriesTable.slug, req.params.slug));
  if (!series) return res.status(404).json({ error: "Series not found" });
  const episodes = await db.select().from(episodesTable).where(and(eq(episodesTable.seriesId, series.id), eq(episodesTable.status, "published"))).orderBy(episodesTable.episodeNumber);
  return res.json({ ...series, episodes });
});

router.get("/me/history", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const history = await db.select({ progress: watchProgressTable, history: watchHistoryTable, episode: episodesTable, series: seriesTable })
    .from(watchProgressTable)
    .innerJoin(episodesTable, eq(episodesTable.id, watchProgressTable.episodeId))
    .innerJoin(seriesTable, eq(seriesTable.id, episodesTable.seriesId))
    .leftJoin(watchHistoryTable, and(eq(watchHistoryTable.userId, user.id), eq(watchHistoryTable.episodeId, episodesTable.id)))
    .where(eq(watchProgressTable.userId, user.id))
    .orderBy(desc(watchProgressTable.updatedAt));
  return res.json(history);
});

router.post("/me/progress", requireAuth(), async (req, res) => {
  const parsed = progressBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const { episodeId, positionSeconds, durationSeconds, completed = false } = parsed.data;
  const [progress] = await db.insert(watchProgressTable).values({ userId: user.id, episodeId, positionSeconds, durationSeconds, completed }).onConflictDoUpdate({
    target: [watchProgressTable.userId, watchProgressTable.episodeId],
    set: { positionSeconds, durationSeconds, completed, updatedAt: new Date() },
  }).returning();
  await db.insert(watchHistoryTable).values({ userId: user.id, episodeId, completed }).onConflictDoUpdate({
    target: [watchHistoryTable.userId, watchHistoryTable.episodeId],
    set: { completed, watchedAt: new Date() },
  });
  return res.json(progress);
});

router.get("/me/list", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const rows = await db.select({ series: seriesTable }).from(favoritesTable).innerJoin(seriesTable, eq(seriesTable.id, favoritesTable.seriesId)).where(eq(favoritesTable.userId, user.id));
  return res.json(rows.map((row) => row.series));
});

router.post("/me/list", requireAuth(), async (req, res) => {
  const parsed = listBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const seriesId = await resolveSeriesId(parsed.data.seriesId);
  if (!seriesId) return res.status(404).json({ error: "Series not found" });
  await db.insert(favoritesTable).values({ userId: user.id, seriesId }).onConflictDoNothing();
  return res.status(201).json({ saved: true });
});

router.delete("/me/list/:seriesId", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const seriesId = await resolveSeriesId(String(req.params.seriesId));
  if (!seriesId) return res.status(404).json({ error: "Series not found" });
  await db.delete(favoritesTable).where(and(eq(favoritesTable.userId, user.id), eq(favoritesTable.seriesId, seriesId)));
  return res.json({ saved: false });
});

router.get("/me/following", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const rows = await db.select({ series: seriesTable }).from(followingTable).innerJoin(seriesTable, eq(seriesTable.id, followingTable.seriesId)).where(eq(followingTable.userId, user.id));
  return res.json(rows.map((row) => row.series));
});

router.post("/me/following", requireAuth(), async (req, res) => {
  const parsed = listBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const seriesId = await resolveSeriesId(parsed.data.seriesId);
  if (!seriesId) return res.status(404).json({ error: "Series not found" });
  await db.insert(followingTable).values({ userId: user.id, seriesId }).onConflictDoNothing();
  return res.status(201).json({ following: true });
});

router.delete("/me/following/:seriesId", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const seriesId = await resolveSeriesId(String(req.params.seriesId));
  if (!seriesId) return res.status(404).json({ error: "Series not found" });
  await db.delete(followingTable).where(and(eq(followingTable.userId, user.id), eq(followingTable.seriesId, seriesId)));
  return res.json({ following: false });
});

router.get("/me/wallet", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));
  const transactions = await db.select().from(coinTransactionsTable).where(eq(coinTransactionsTable.userId, user.id)).orderBy(desc(coinTransactionsTable.createdAt)).limit(30);
  return res.json({ wallet, transactions });
});

router.get("/me/rewards", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const [rewards, missions, progress] = await Promise.all([
    db.select().from(rewardsTable).where(eq(rewardsTable.active, true)),
    db.select().from(missionsTable).where(eq(missionsTable.active, true)),
    db.select().from(missionProgressTable).where(eq(missionProgressTable.userId, user.id)),
  ]);
  return res.json({ rewards, missions: missions.map((mission) => ({ ...mission, progress: progress.find((item) => item.missionId === mission.id) ?? null })) });
});

router.get("/me/notifications", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  return res.json(await db.select().from(notificationsTable).where(eq(notificationsTable.userId, user.id)).orderBy(desc(notificationsTable.createdAt)).limit(50));
});

router.post("/rewards/:key/claim", requireAuth(), async (req, res) => {
  const user = await ensureLocalUser(req);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  const [reward] = await db.select().from(rewardsTable).where(and(eq(rewardsTable.key, String(req.params.key)), eq(rewardsTable.active, true)));
  if (!reward) return res.status(404).json({ error: "Reward not found" });
  const existing = await db.select().from(rewardClaimsTable).where(and(eq(rewardClaimsTable.rewardId, reward.id), eq(rewardClaimsTable.userId, user.id)));
  if (existing.length) return res.status(409).json({ error: "Reward already claimed" });
  const result = await db.transaction(async (tx) => {
    const [wallet] = await tx.select().from(walletsTable).where(eq(walletsTable.userId, user.id)).for("update");
    if (!wallet) throw new Error("Wallet not found");
    const coinBalance = wallet.coinBalance + reward.coinAmount;
    const bonusBalance = wallet.bonusBalance + reward.bonusAmount;
    await tx.update(walletsTable).set({ coinBalance, bonusBalance, updatedAt: new Date() }).where(eq(walletsTable.id, wallet.id));
    const [ledger] = await tx.insert(coinTransactionsTable).values({ walletId: wallet.id, userId: user.id, type: "reward", coinDelta: reward.coinAmount, bonusDelta: reward.bonusAmount, balanceAfter: coinBalance, bonusAfter: bonusBalance, referenceType: "reward", referenceId: String(reward.id), idempotencyKey: `reward:${user.id}:${reward.id}` }).returning();
    await tx.insert(rewardClaimsTable).values({ rewardId: reward.id, userId: user.id, coinTransactionId: ledger.id });
    return { wallet: { coinBalance, bonusBalance }, ledger };
  });
  return res.status(201).json(result);
});

router.get("/ads/rewarded", requireAuth(), async (_req, res) => {
  if (!process.env.REWARDED_AD_PROVIDER) return res.status(503).json({ status: "unavailable", reason: "No rewarded-ad provider configured" });
  return res.status(501).json({ status: "unavailable", reason: "Provider adapter not implemented" });
});

router.post("/payments/checkout", requireAuth(), async (_req, res) => {
  if (!process.env.PAYMENT_PROVIDER) return res.status(503).json({ status: "unavailable", reason: "No payment provider configured" });
  return res.status(501).json({ status: "unavailable", reason: "Payment provider adapter not configured" });
});

router.post("/payments/webhooks/:provider", async (_req, res) => {
  if (!process.env.PAYMENT_PROVIDER) return res.status(503).json({ status: "unavailable", reason: "No payment provider configured" });
  return res.status(501).json({ status: "unavailable", reason: "Webhook adapter not configured" });
});

router.post("/ai/video-jobs", requireAuth(), async (_req, res) => {
  if (!process.env.AI_VIDEO_PROVIDER) return res.status(503).json({ status: "unavailable", reason: "No AI video provider configured" });
  return res.status(501).json({ status: "unavailable", reason: "AI video provider adapter not configured" });
});

router.get("/admin/overview", requireAdmin, async (_req, res) => {
  const [[users], [series], [episodes], [events], [revenue]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(seriesTable),
    db.select({ count: sql<number>`count(*)` }).from(episodesTable),
    db.select({ count: sql<number>`count(*)` }).from(analyticsEventsTable),
    db.select({ total: sql<number>`coalesce(sum(${paymentTransactionsTable.amountMinor}), 0)` }).from(paymentTransactionsTable).where(eq(paymentTransactionsTable.status, "succeeded")),
  ]);
  return res.json({ users: Number(users?.count ?? 0), series: Number(series?.count ?? 0), episodes: Number(episodes?.count ?? 0), events: Number(events?.count ?? 0), revenueMinor: Number(revenue?.total ?? 0) });
});

router.get("/admin/users", requireAdmin, async (_req, res) => {
  return res.json(await db.select({ id: usersTable.id, clerkUserId: usersTable.clerkUserId, email: usersTable.email, status: usersTable.status, createdAt: usersTable.createdAt }).from(usersTable).orderBy(desc(usersTable.createdAt)).limit(100));
});

router.get("/admin/series", requireAdmin, async (_req, res) => {
  return res.json(await db.select().from(seriesTable).orderBy(desc(seriesTable.createdAt)));
});

router.get("/admin/transactions", requireAdmin, async (_req, res) => {
  return res.json(await db.select().from(paymentTransactionsTable).orderBy(desc(paymentTransactionsTable.createdAt)).limit(100));
});

router.get("/admin/analytics", requireAdmin, async (_req, res) => {
  return res.json(await db.select({ name: analyticsEventsTable.name, count: sql<number>`count(*)` }).from(analyticsEventsTable).groupBy(analyticsEventsTable.name).orderBy(desc(sql`count(*)`)).limit(30));
});

router.post("/analytics/events", async (req, res) => {
  const parsed = z.object({ name: z.string().min(1).max(100), path: z.string().optional(), properties: z.record(z.unknown()).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = getAuth(req).userId ? await ensureLocalUser(req) : null;
  await db.insert(analyticsEventsTable).values({ userId: user?.id, name: parsed.data.name, path: parsed.data.path, properties: parsed.data.properties ?? {} });
  return res.status(202).json({ accepted: true });
});

export default router;