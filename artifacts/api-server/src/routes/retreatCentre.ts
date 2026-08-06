import { Router, type IRouter } from "express";
import {
  CreateAccommodationBody,
  CreateAccommodationResponse,
  CreateAnnouncementBody,
  CreateAnnouncementResponse,
  CreateDonationBody,
  CreateDonationResponse,
  CreatePrayerRequestBody,
  CreatePrayerRequestResponse,
  CreateRegistrationBody,
  CreateRegistrationResponse,
  CreateRetreatBody,
  CreateRetreatResponse,
  GetAccommodationQueryParams,
  GetAccommodationResponse,
  GetAdminSummaryResponse,
  GetDashboardSummaryQueryParams,
  GetDashboardSummaryResponse,
  GetRetreatResponse,
  GetRetreatParams,
  ListAnnouncementsResponse,
  ListCertificatesQueryParams,
  ListCertificatesResponse,
  ListDonationsResponse,
  ListEventsResponse,
  ListGalleryItemsResponse,
  ListPrayerRequestsQueryParams,
  ListPrayerRequestsResponse,
  ListRegistrationsQueryParams,
  ListRegistrationsResponse,
  ListRetreatsQueryParams,
  ListRetreatsResponse,
  UpdateRegistrationStatusBody,
  UpdateRegistrationStatusParams,
  UpdateRegistrationStatusResponse,
  UpdateRetreatBody,
  UpdateRetreatParams,
  UpdateRetreatResponse,
} from "@workspace/api-zod";
import {
  createRecord,
  findRecord,
  getRecord,
  listRecords,
  updateRecord,
} from "../lib/retreatCentreStore";

const router: IRouter = Router();

function asRecord(record: { id: number; data: Record<string, unknown> }) {
  return { id: record.id, ...record.data };
}

function asRetreat(record: { id: number; data: Record<string, unknown> }) {
  return CreateRetreatResponse.parse({
    ...asRecord(record),
    enrolled: record.data.enrolled ?? 0,
    status: record.data.status ?? "upcoming",
  });
}

function asRegistration(record: { id: number; data: Record<string, unknown> }) {
  return CreateRegistrationResponse.parse(asRecord(record));
}

router.get("/retreats", async (req, res): Promise<void> => {
  const parsed = ListRetreatsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let retreats = (await listRecords("retreat")).map(asRetreat);
  if (parsed.data.status !== "all") {
    retreats = retreats.filter((retreat) => retreat.status === parsed.data.status);
  }
  if (parsed.data.search) {
    const query = parsed.data.search.toLowerCase();
    retreats = retreats.filter((retreat) =>
      `${retreat.title} ${retreat.description} ${retreat.spiritualTheme}`
        .toLowerCase()
        .includes(query),
    );
  }
  res.json(ListRetreatsResponse.parse(retreats));
});

router.post("/retreats", async (req, res): Promise<void> => {
  const parsed = CreateRetreatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const record = await createRecord("retreat", {
    ...parsed.data,
    enrolled: 0,
    status: "upcoming",
  });
  res.status(201).json(asRetreat(record));
});

router.get("/retreats/:id", async (req, res): Promise<void> => {
  const parsed = GetRetreatParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const record = await getRecord(parsed.data.id);
  if (!record || record.entity !== "retreat") {
    res.status(404).json({ error: "Retreat not found" });
    return;
  }
  res.json(GetRetreatResponse.parse(asRetreat(record)));
});

router.patch("/retreats/:id", async (req, res): Promise<void> => {
  const params = UpdateRetreatParams.safeParse(req.params);
  const body = UpdateRetreatBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const current = await getRecord(params.data.id);
  if (!current || current.entity !== "retreat") {
    res.status(404).json({ error: "Retreat not found" });
    return;
  }
  const updated = await updateRecord(params.data.id, {
    ...current.data,
    ...body.data,
    enrolled: current.data.enrolled ?? 0,
    status: current.data.status ?? "upcoming",
  });
  res.json(UpdateRetreatResponse.parse(asRetreat(updated!)));
});

router.get("/registrations", async (req, res): Promise<void> => {
  const parsed = ListRegistrationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let registrations = (await listRecords("registration")).map(asRegistration);
  if (parsed.data.email) {
    registrations = registrations.filter((item) => item.email === parsed.data.email);
  }
  if (parsed.data.status !== "all") {
    registrations = registrations.filter((item) => item.status === parsed.data.status);
  }
  res.json(ListRegistrationsResponse.parse(registrations));
});

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const retreat = await getRecord(parsed.data.retreatId);
  if (!retreat || retreat.entity !== "retreat") {
    res.status(404).json({ error: "Retreat not found" });
    return;
  }
  const registration = await createRecord("registration", {
    ...parsed.data,
    retreatTitle: retreat.data.title,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  const enrolled = Number(retreat.data.enrolled ?? 0) + parsed.data.guests;
  await updateRecord(retreat.id, { ...retreat.data, enrolled });
  res.status(201).json(asRegistration(registration));
});

router.patch("/registrations/:id/status", async (req, res): Promise<void> => {
  const params = UpdateRegistrationStatusParams.safeParse(req.params);
  const body = UpdateRegistrationStatusBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const record = await getRecord(params.data.id);
  if (!record || record.entity !== "registration") {
    res.status(404).json({ error: "Registration not found" });
    return;
  }
  const updated = await updateRecord(record.id, { ...record.data, status: body.data.status });
  res.json(UpdateRegistrationStatusResponse.parse(asRegistration(updated!)));
});

router.get("/prayer-requests", async (req, res): Promise<void> => {
  const parsed = ListPrayerRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let requests = (await listRecords("prayer")).map((record) =>
    CreatePrayerRequestResponse.parse(asRecord(record)),
  );
  if (parsed.data.email) requests = requests.filter((item) => item.email === parsed.data.email);
  res.json(ListPrayerRequestsResponse.parse(requests));
});

router.post("/prayer-requests", async (req, res): Promise<void> => {
  const parsed = CreatePrayerRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const record = await createRecord("prayer", {
    ...parsed.data,
    status: "new",
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(CreatePrayerRequestResponse.parse(asRecord(record)));
});

router.get("/donations", async (_req, res): Promise<void> => {
  const donations = (await listRecords("donation")).map((record) =>
    CreateDonationResponse.parse(asRecord(record)),
  );
  res.json(ListDonationsResponse.parse(donations));
});

router.post("/donations", async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const record = await createRecord("donation", {
    ...parsed.data,
    status: "pledged",
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(CreateDonationResponse.parse(asRecord(record)));
});

router.get("/accommodations", async (req, res): Promise<void> => {
  const parsed = GetAccommodationQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const record = await findRecord("accommodation", "registrationId", parsed.data.registrationId);
  if (!record) {
    res.status(404).json({ error: "Accommodation not found" });
    return;
  }
  res.json(GetAccommodationResponse.parse(asRecord(record)));
});

router.post("/accommodations", async (req, res): Promise<void> => {
  const parsed = CreateAccommodationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const record = await createRecord("accommodation", {
    ...parsed.data,
    status: "requested",
    notes: parsed.data.notes ?? "",
  });
  res.status(201).json(CreateAccommodationResponse.parse(asRecord(record)));
});

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const parsed = GetDashboardSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const registrations = (await listRecords("registration"))
    .filter((record) => record.data.email === parsed.data.email)
    .map(asRegistration);
  const prayers = (await listRecords("prayer")).filter(
    (record) => record.data.email === parsed.data.email,
  );
  const certificates = (await listRecords("certificate")).filter(
    (record) => record.data.email === parsed.data.email,
  );
  res.json(
    GetDashboardSummaryResponse.parse({
      participantName: registrations[0]?.fullName ?? "Friend",
      nextRetreat: registrations.find((registration) => registration.status !== "cancelled") ?? null,
      totalRetreats: registrations.length,
      prayerCount: prayers.length,
      certificateCount: certificates.length,
      notifications: (await listRecords("announcement")).filter((record) => record.data.isPinned).length,
    }),
  );
});

router.get("/certificates", async (req, res): Promise<void> => {
  const parsed = ListCertificatesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const certificates = (await listRecords("certificate"))
    .filter((record) => record.data.email === parsed.data.email)
    .map((record) => asRecord(record));
  res.json(ListCertificatesResponse.parse(certificates));
});

router.get("/announcements", async (_req, res): Promise<void> => {
  const announcements = (await listRecords("announcement")).map((record) => asRecord(record));
  res.json(ListAnnouncementsResponse.parse(announcements));
});

router.post("/announcements", async (req, res): Promise<void> => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const record = await createRecord("announcement", {
    ...parsed.data,
    publishedAt: new Date().toISOString(),
  });
  res.status(201).json(CreateAnnouncementResponse.parse(asRecord(record)));
});

router.get("/gallery", async (_req, res): Promise<void> => {
  const items = (await listRecords("gallery")).map((record) => asRecord(record));
  res.json(ListGalleryItemsResponse.parse(items));
});

router.get("/events", async (_req, res): Promise<void> => {
  const events = (await listRecords("event")).map((record) => asRecord(record));
  res.json(ListEventsResponse.parse(events));
});

router.get("/admin/summary", async (_req, res): Promise<void> => {
  const retreats = (await listRecords("retreat")).map(asRetreat);
  const registrations = (await listRecords("registration")).map(asRegistration);
  const prayers = await listRecords("prayer");
  const donations = await listRecords("donation");
  const donationsThisMonth = donations.reduce(
    (sum, donation) => sum + Number(donation.data.amount ?? 0),
    0,
  );
  const capacity = retreats.reduce((sum, retreat) => sum + Number(retreat.capacity), 0);
  const enrolled = retreats.reduce((sum, retreat) => sum + Number(retreat.enrolled), 0);
  res.json(
    GetAdminSummaryResponse.parse({
      upcomingRetreats: retreats.filter((retreat) => retreat.status === "upcoming").length,
      totalRegistrations: registrations.length,
      pendingPrayers: prayers.filter((prayer) => prayer.data.status !== "answered").length,
      donationsThisMonth,
      occupancyRate: capacity ? Math.round((enrolled / capacity) * 100) : 0,
      recentRegistrations: registrations.slice(-5).reverse(),
    }),
  );
});

export default router;