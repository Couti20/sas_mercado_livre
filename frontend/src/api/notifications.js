/**
 * API service functions for notifications (bell icon).
 */

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8081';

const getAuthToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error("Failed to get auth token from localStorage", error);
        return null;
    }
};

/**
 * Fetches all notifications for the logged-in user.
 * @returns {Promise<any[]>} A promise that resolves to an array of notifications.
 */
export const getNotifications = async () => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found.');
    }

    const response = await fetch(`${getApiUrl()}/api/notifications`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch notifications.');
    }

    return response.json();
};

/**
 * Get unread notifications count.
 * @returns {Promise<{count: number}>}
 */
export const getUnreadCount = async () => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found.');
    }

    const response = await fetch(`${getApiUrl()}/api/notifications/unread-count`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch unread count.');
    }

    return response.json();
};

/**
 * Mark a notification as read.
 * @param {number} notificationId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const markAsRead = async (notificationId) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found.');
    }

    const response = await fetch(`${getApiUrl()}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to mark notification as read.');
    }

    return response.json();
};

/**
 * Mark all notifications as read.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const markAllAsRead = async () => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found.');
    }

    const response = await fetch(`${getApiUrl()}/api/notifications/read-all`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to mark all notifications as read.');
    }

    return response.json();
};

/**
 * Delete all notifications.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteAllNotifications = async () => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found.');
    }

    const response = await fetch(`${getApiUrl()}/api/notifications`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete notifications.');
    }

    return response.json();
};
