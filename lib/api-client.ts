import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { Booking } from '@/types'
import { toast } from 'react-toastify'
import { getToken, clearToken } from './auth-token'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 errors (token expired or unauthorized)
        if (error.response?.status === 401) {
          clearToken()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Show detailed error information via toast
        if (error.response) {
          // Server responded with error status
          const errorMsg = error.response.data?.message || error.response.data?.error || 'Server error occurred'
          toast.error(`API Error (${error.response.status}): ${errorMsg}`)
        } else if (error.request) {
          // Request made but no response received
          toast.error('No response from server. Please check your connection.')
        } else {
          // Something else happened
          toast.error(`Request failed: ${error.message}`)
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // Vehicles
  async getVehicles(params?: { status?: string; available?: boolean }) {
    return this.get('/vehicles', { params })
  }

  async getVehicle(id: string) {
    return this.get(`/vehicles/${id}`)
  }

  async createVehicle(data: any) {
    return this.post('/vehicles', data)
  }

  async updateVehicle(id: string, data: any) {
    return this.put(`/vehicles/${id}`, data)
  }

  async deleteVehicle(id: string) {
    return this.delete(`/vehicles/${id}`)
  }

  async getAvailableVehicles() {
    return this.get('/vehicles/available')
  }

  async getNearestVehicles(params: { lat: number; lng: number; limit?: number }) {
    return this.get('/vehicles/nearest', { params })
  }

  // Drivers
  async getDrivers() {
    return this.get('/drivers')
  }

  async getDriver(id: string) {
    return this.get(`/drivers/${id}`)
  }

  async createDriver(data: any) {
    return this.post('/drivers', data)
  }

  async updateDriver(id: string, data: any) {
    return this.put(`/drivers/${id}`, data)
  }

  async deleteDriver(id: string) {
    return this.delete(`/drivers/${id}`)
  }

  async getAvailableDrivers() {
    return this.get('/drivers/available')
  }

  // Bookings
  async getBookings(params?: { status?: string }) {
    return this.get('/bookings', { params })
  }

  async getBooking(id: string) {
    return this.get(`/bookings/${id}`)
  }

  async createBooking(data: any) {
    return this.post('/bookings', data)
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    return this.put<Booking>(`/bookings/${id}`, data)
  }

  async deleteBooking(id: string) {
    return this.delete(`/bookings/${id}`)
  }

  async allocateBooking(id: string, data: { vehicleId: string; driverId: string }) {
    return this.post(`/bookings/${id}/allocate`, data)
  }

  async sendToHolidayTaxis(id: string, data: { holidayTaxisBookingRef: string }) {
    return this.post(`/bookings/${id}/send-to-holidaytaxis`, data)
  }

  async updateBookingStatus(id: string, status: string) {
    return this.put(`/bookings/${id}/status`, { status })
  }

  async getSuggestedVehicles(id: string) {
    return this.get(`/bookings/${id}/suggested-vehicles`)
  }

  async autoAllocateBooking(id: string) {
    return this.post(`/bookings/${id}/auto-allocate`)
  }

  async importBookingsCSV(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post('/bookings/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data)
  }

  // Integration endpoints
  async syncVehiclePositions() {
    return this.post('/integration/sync/vehicle-positions')
  }

  async fullSync() {
    return this.post('/integration/sync/full')
  }

  async healthCheck() {
    return this.get('/integration/health')
  }
}

export const apiClient = new ApiClient()
export default apiClient
