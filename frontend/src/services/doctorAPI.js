// frontend/src/services/doctorAPI.js
import api from './api';

export const doctorAPI = {
  /**
   * Retrieves the doctor queue (completed interviews).
   * @param {Object} params - Query parameters (status, search).
   * @returns {Promise<Object>} The response containing the queue array.
   */
  getQueue: async (params = {}) => {
    const response = await api.get('/doctor/queue', { params });
    return response.data;
  },

  /**
   * Retrieves the full clinical record for a specific interview.
   * @param {string} id - The interview ID.
   * @returns {Promise<Object>} The response containing the record object.
   */
  getPatientDetail: async (id) => {
    const response = await api.get(`/doctor/patients/${id}`);
    return response.data;
  },

  /**
   * Marks a specific interview as REVIEWED.
   * @param {string} id - The interview ID.
   * @returns {Promise<Object>} The updated record.
   */
  markReviewed: async (id) => {
    const response = await api.patch(`/doctor/interviews/${id}/review`);
    return response.data;
  },

  /**
   * Retrieves all documents for a patient.
   * Note: Returns empty array if access denied (403) — patient JWT required.
   * @param {string} patientId - The patient ID.
   * @returns {Promise<Object>} The response containing the documents array.
   */
  getPatientDocuments: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/documents`);
      return response.data;
    } catch (err) {
      // 403 = patient JWT required (cross-patient protection) — return empty gracefully
      if (err?.response?.status === 403) return { success: true, documents: [] };
      throw err;
    }
  }
};
