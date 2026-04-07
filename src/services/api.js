import axios from 'axios';

const MOCK_RECOMMENDATIONS_KEY = 'mockRecommendations';

const defaultMockRecommendations = [
  {
    id: 'mock-1',
    title: 'Modern Kitchen Renovation',
    description: 'Upgrade your kitchen with modular cabinets, granite countertops, and energy-efficient appliances',
    category: 'Kitchen',
    propertyType: 'All',
    costRange: '₹1,00,000 - ₹2,50,000',
    impact: 'High',
    priority: 'High',
    timeframe: '2-3 weeks'
  },
  {
    id: 'mock-2',
    title: 'Bathroom Remodeling',
    description: 'Install modern fixtures, waterproofing, and elegant tiles for a spa-like experience',
    category: 'Bathroom',
    propertyType: 'All',
    costRange: '₹50,000 - ₹1,50,000',
    impact: 'Medium',
    priority: 'High',
    timeframe: '1-2 weeks'
  },
  {
    id: 'mock-3',
    title: 'Flooring Upgrade',
    description: 'Replace old flooring with vitrified tiles or hardwood for a premium look',
    category: 'Flooring',
    propertyType: 'All',
    costRange: '₹1,50,000 - ₹3,00,000',
    impact: 'High',
    priority: 'Medium',
    timeframe: '1-2 weeks'
  },
  {
    id: 'mock-4',
    title: 'Smart Home Automation',
    description: 'Install smart lighting, AC controls, and security systems',
    category: 'Technology',
    propertyType: 'Villa',
    costRange: '₹75,000 - ₹2,00,000',
    impact: 'Medium',
    priority: 'Low',
    timeframe: '1 week'
  },
  {
    id: 'mock-5',
    title: 'Exterior Painting',
    description: 'Fresh coat of weather-resistant paint to enhance curb appeal',
    category: 'Exterior',
    propertyType: 'All',
    costRange: '₹80,000 - ₹2,00,000',
    impact: 'High',
    priority: 'Medium',
    timeframe: '1 week'
  },
  {
    id: 'mock-6',
    title: 'Landscaping & Garden',
    description: 'Create a beautiful garden with plants, lighting, and seating areas',
    category: 'Exterior',
    propertyType: 'Villa',
    costRange: '₹50,000 - ₹1,50,000',
    impact: 'Medium',
    priority: 'Low',
    timeframe: '2 weeks'
  }
];

const getLocalRecommendations = () => {
  const saved = localStorage.getItem(MOCK_RECOMMENDATIONS_KEY);
  if (!saved) {
    localStorage.setItem(MOCK_RECOMMENDATIONS_KEY, JSON.stringify(defaultMockRecommendations));
    return [...defaultMockRecommendations];
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [...defaultMockRecommendations];
    }

    const migrated = parsed.map((item, index) => ({
      ...item,
      id: item?.id ?? item?._id ?? item?.propertyId ?? item?.propertyID ?? `mock-${Date.now()}-${index}`
    }));

    setLocalRecommendations(migrated);
    return migrated;
  } catch {
    localStorage.setItem(MOCK_RECOMMENDATIONS_KEY, JSON.stringify(defaultMockRecommendations));
    return [...defaultMockRecommendations];
  }
};

const setLocalRecommendations = (items) => {
  localStorage.setItem(MOCK_RECOMMENDATIONS_KEY, JSON.stringify(items));
};

const getRecommendationId = (item) => item?.id ?? item?._id ?? item?.propertyId ?? item?.propertyID ?? item?.recommendationId;

const normalizeRecommendation = (item, fallbackId) => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const resolvedId = getRecommendationId(item) ?? fallbackId;
  return {
    ...item,
    id: resolvedId
  };
};

const recommendationSignature = (item) => {
  const title = (item?.title || '').toString().trim().toLowerCase();
  const category = (item?.category || '').toString().trim().toLowerCase();
  const costRange = (item?.costRange || '').toString().trim().toLowerCase();
  return `${title}|${category}|${costRange}`;
};

const mergeRecommendations = (primaryList, secondaryList) => {
  const merged = [];
  const seen = new Set();

  [...primaryList, ...secondaryList].forEach((item, index) => {
    const normalized = normalizeRecommendation(item, `merged-${Date.now()}-${index}`);
    if (!normalized) return;

    const id = getRecommendationId(normalized);
    const key = id !== undefined && id !== null ? `id:${String(id)}` : `sig:${recommendationSignature(normalized)}`;
    if (seen.has(key)) return;

    seen.add(key);
    merged.push(normalized);
  });

  return merged;
};

const extractRecommendationList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.result)) return payload.result;

  if (payload && typeof payload === 'object') {
    const hasRecommendationFields = Boolean(payload.title || payload.category || payload.costRange || payload.description);
    if (hasRecommendationFields) {
      return [payload];
    }
  }

  return [];
};

const extractSingleRecommendation = (payload) => {
  const list = extractRecommendationList(payload);
  if (list.length > 0) return list[0];

  if (payload && typeof payload === 'object') {
    if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      return payload.data;
    }
    return payload;
  }

  return null;
};

const api = axios.create({
  baseURL: 'http://localhost:8080/api',  // Note: /api is included here
  headers: {
    'Content-Type': 'application/json'
  }
});

const handleApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;
  throw new Error(message);
};

export const loginUser = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to login user.');
  }
};

export const registerUser = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to register user.');
  }
};

// This is called by UserDashboard to show popular enhancement ideas
export const getAllProperties = async () => {
  const localItems = getLocalRecommendations();
  try {
    const response = await api.get('/properties');
    const backendItems = extractRecommendationList(response.data).map((item, index) =>
      normalizeRecommendation(item, `api-${Date.now()}-${index}`)
    ).filter(Boolean);

    if (backendItems.length === 0) {
      return localItems;
    }

    const merged = mergeRecommendations(backendItems, localItems);
    setLocalRecommendations(merged);
    return merged;
  } catch (error) {
    return localItems;
  }
};

export const addProperty = async (data) => {
  const localItems = getLocalRecommendations();
  try {
    const response = await api.post('/properties', data);
    const created = normalizeRecommendation(
      extractSingleRecommendation(response.data) || data,
      `mock-${Date.now()}`
    );

    const updatedLocal = mergeRecommendations([created], localItems);
    setLocalRecommendations(updatedLocal);
    return created;
  } catch (error) {
    const created = normalizeRecommendation(data, `mock-${Date.now()}`);
    const updatedLocal = mergeRecommendations([created], localItems);
    setLocalRecommendations(updatedLocal);
    return created;
  }
};

export const updateProperty = async (id, data) => {
  const localItems = getLocalRecommendations();
  const updateLocal = (incoming) => {
    const normalizedIncoming = normalizeRecommendation(incoming, String(id));
    const updatedLocal = localItems.map((item) =>
      String(getRecommendationId(item)) === String(id)
        ? { ...item, ...normalizedIncoming, id: getRecommendationId(item) ?? String(id) }
        : item
    );
    setLocalRecommendations(updatedLocal);
    return updatedLocal.find((item) => String(getRecommendationId(item)) === String(id));
  };

  try {
    const response = await api.put(`/properties/${id}`, data);
    const updatedFromApi = extractSingleRecommendation(response.data) || data;
    return updateLocal(updatedFromApi);
  } catch (error) {
    return updateLocal(data);
  }
};

export const deleteProperty = async (id) => {
  const localItems = getLocalRecommendations();
  const deleteLocal = () => {
    const updated = localItems.filter((item) => String(getRecommendationId(item)) !== String(id));
    setLocalRecommendations(updated);
    return { success: true };
  };

  try {
    const response = await api.delete(`/properties/${id}`);
    deleteLocal();
    return response.data || { success: true };
  } catch (error) {
    return deleteLocal();
  }
};

export default api;