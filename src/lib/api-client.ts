import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import {
  getMockMenuItems, getMockCategories, getMockOffers, getMockFeedback,
  getMockOrders, getMockDashboardStats, getMockTopSelling, getMockCatering,
  saveMockMenuItem, deleteMockMenuItem, saveMockOrder, updateMockOrderStatus,
  saveMockFeedback, updateMockFeedback, deleteMockFeedback,
  saveMockOffer, deleteMockOffer, saveMockCateringInquiry,
  updateMockCateringStatus, getMockAvgRating,
  mockAdminLogin,
} from "@/lib/mockApi";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
  isSpecial: boolean;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  discountPercent: number | null;
  validFrom: string | null;
  validUntil: string | null;
  active: boolean;
}

export interface Feedback {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  status: string;
  featured: boolean;
  createdAt: string;
}

export interface OrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  notes: string | null;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  revenue: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalMenuItems: number;
  totalFeedback: number;
}

export interface TopSellingItem {
  menuItemId: number;
  name: string;
  totalOrdered: number;
  revenue: number;
}

export interface CateringInquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  eventDate: string;
  guestCount: number;
  eventType: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

export interface AdminLoginResponse {
  token: string;
}

// ─── Query Key Factories ────────────────────────────────────────────────────

export const getListMenuItemsQueryKey = (params: Record<string, unknown>) =>
  ["menu-items", params] as const;

export const getListCategoriesQueryKey = () =>
  ["categories"] as const;

export const getListOffersQueryKey = (params: Record<string, unknown>) =>
  ["offers", params] as const;

export const getListFeedbackQueryKey = (params: Record<string, unknown>) =>
  ["feedback", params] as const;

export const getListOrdersQueryKey = (params: Record<string, unknown>) =>
  ["orders", params] as const;

export const getDashboardStatsQueryKey = () =>
  ["dashboard-stats"] as const;

export const getTopSellingItemsQueryKey = () =>
  ["top-selling-items"] as const;

export const getListCateringInquiriesQueryKey = () =>
  ["catering-inquiries"] as const;

// ─── Query Hooks ────────────────────────────────────────────────────────────

export function useListMenuItems(
  params: { available?: boolean } = {},
  options?: { query?: Partial<UseQueryOptions<MenuItem[], Error>> }
) {
  return useQuery<MenuItem[], Error>({
    queryKey: getListMenuItemsQueryKey(params),
    queryFn: () => getMockMenuItems(params.available) as MenuItem[],
    ...options?.query,
  });
}

export function useListCategories(
  options?: { query?: Partial<UseQueryOptions<string[], Error>> }
) {
  return useQuery<string[], Error>({
    queryKey: getListCategoriesQueryKey(),
    queryFn: () => getMockCategories(),
    ...options?.query,
  });
}

export function useListOffers(
  params: { active?: boolean; all?: boolean } = {},
  options?: { query?: Partial<UseQueryOptions<Offer[], Error>> }
) {
  return useQuery<Offer[], Error>({
    queryKey: getListOffersQueryKey(params),
    queryFn: () => getMockOffers(params.active) as Offer[],
    ...options?.query,
  });
}

export function useListFeedback(
  params: { all?: boolean } = {},
  options?: { query?: Partial<UseQueryOptions<Feedback[], Error>> }
) {
  return useQuery<Feedback[], Error>({
    queryKey: getListFeedbackQueryKey(params),
    queryFn: () => getMockFeedback(params.all) as Feedback[],
    ...options?.query,
  });
}

export function useListOrders(
  params: { status?: string } = {},
  options?: { query?: Partial<UseQueryOptions<Order[], Error>> & { refetchInterval?: number } }
) {
  return useQuery<Order[], Error>({
    queryKey: getListOrdersQueryKey(params),
    queryFn: () => getMockOrders(params.status) as Order[],
    refetchInterval: options?.query?.refetchInterval,
    ...options?.query,
  });
}

export function useGetDashboardStats(
  options?: { query?: Partial<UseQueryOptions<DashboardStats, Error>> }
) {
  return useQuery<DashboardStats, Error>({
    queryKey: getDashboardStatsQueryKey(),
    queryFn: () => getMockDashboardStats(),
    ...options?.query,
  });
}

export function useGetTopSellingItems(
  options?: { query?: Partial<UseQueryOptions<TopSellingItem[], Error>> }
) {
  return useQuery<TopSellingItem[], Error>({
    queryKey: getTopSellingItemsQueryKey(),
    queryFn: () => getMockTopSelling() as TopSellingItem[],
    ...options?.query,
  });
}

export function useListCateringInquiries(
  options?: { query?: Partial<UseQueryOptions<CateringInquiry[], Error>> }
) {
  return useQuery<CateringInquiry[], Error>({
    queryKey: getListCateringInquiriesQueryKey(),
    queryFn: () => getMockCatering() as CateringInquiry[],
    ...options?.query,
  });
}

// ─── Mutation Hooks ─────────────────────────────────────────────────────────

export function useAdminLogin(
  options?: UseMutationOptions<AdminLoginResponse, Error, { data: { email: string; password: string } }>
) {
  return useMutation<AdminLoginResponse, Error, { data: { email: string; password: string } }>({
    mutationFn: ({ data }) => {
      try {
        return Promise.resolve(mockAdminLogin(data.email, data.password));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    ...options,
  });
}

export function useCreateOrder(
  options?: UseMutationOptions<
    Order,
    Error,
    { data: { customerName: string; customerPhone: string; pickupDate: string; pickupTime: string; notes?: string; items: OrderItem[] } }
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => {
      const result = saveMockOrder(data);
      return Promise.resolve(result as Order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    ...options,
  });
}

export function useUpdateOrderStatus(
  options?: UseMutationOptions<Order, Error, { id: number; data: { status: string } }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      const result = updateMockOrderStatus(id, data.status);
      return Promise.resolve(result as Order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    ...options,
  });
}

export function useSubmitFeedback(
  options?: UseMutationOptions<Feedback, Error, { data: { customerName: string; rating: number; comment: string } }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => {
      const result = saveMockFeedback(data);
      return Promise.resolve(result as Feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    ...options,
  });
}

export function useUpdateFeedback(
  options?: UseMutationOptions<Feedback, Error, { id: number; data: { status?: string; featured?: boolean } }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      const result = updateMockFeedback(id, data);
      return Promise.resolve(result as Feedback);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    ...options,
  });
}

export function useDeleteFeedback(
  options?: UseMutationOptions<void, Error, { id: number }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => {
      deleteMockFeedback(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
    ...options,
  });
}

export function useCreateMenuItem(
  options?: UseMutationOptions<MenuItem, Error, { data: Omit<MenuItem, "id"> }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => {
      saveMockMenuItem(data);
      return Promise.resolve(data as MenuItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    ...options,
  });
}

export function useUpdateMenuItem(
  options?: UseMutationOptions<MenuItem, Error, { id: number; data: Partial<Omit<MenuItem, "id">> }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      const items = getMockMenuItems();
      const existing = items.find((i: MenuItem) => i.id === id);
      const updated = { ...existing, ...data, id };
      saveMockMenuItem(updated);
      return Promise.resolve(updated as MenuItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
    ...options,
  });
}

export function useDeleteMenuItem(
  options?: UseMutationOptions<void, Error, { id: number }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => {
      deleteMockMenuItem(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    ...options,
  });
}

export function useCreateOffer(
  options?: UseMutationOptions<Offer, Error, { data: Omit<Offer, "id"> }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => {
      saveMockOffer(data);
      return Promise.resolve(data as Offer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
    ...options,
  });
}

export function useUpdateOffer(
  options?: UseMutationOptions<Offer, Error, { id: number; data: Partial<Omit<Offer, "id">> }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => {
      const offers = getMockOffers();
      const existing = offers.find((o: Offer) => o.id === id);
      const updated = { ...existing, ...data, id };
      saveMockOffer(updated);
      return Promise.resolve(updated as Offer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
    ...options,
  });
}

export function useDeleteOffer(
  options?: UseMutationOptions<void, Error, { id: number }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => {
      deleteMockOffer(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
    ...options,
  });
}

export function useSubmitCateringInquiry(
  options?: UseMutationOptions<
    CateringInquiry,
    Error,
    { data: { name: string; phone: string; email?: string; eventDate: string; guestCount: number; eventType: string; notes?: string } }
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }) => {
      const result = saveMockCateringInquiry(data);
      return Promise.resolve(result as CateringInquiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catering-inquiries"] });
    },
    ...options,
  });
}

export function useUpdateCateringStatus(
  options?: UseMutationOptions<CateringInquiry, Error, { id: number; status: string }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => {
      const result = updateMockCateringStatus(id, status);
      return Promise.resolve(result as CateringInquiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catering-inquiries"] });
    },
    ...options,
  });
}

export function useGetAvgRating(options?: { query?: Partial<UseQueryOptions<number, Error>> }) {
  return useQuery<number, Error>({
    queryKey: ["avg-rating"],
    queryFn: () => getMockAvgRating(),
    ...options?.query,
  });
}
