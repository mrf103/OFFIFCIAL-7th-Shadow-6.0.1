import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api'

export function useManuscripts(params = {}) {
  return useQuery({
    queryKey: ['manuscripts', params],
    queryFn: () => apiClient.getManuscripts(params),
  })
}

export function useManuscript(id) {
  return useQuery({
    queryKey: ['manuscript', id],
    queryFn: () => apiClient.getManuscript(id),
    enabled: !!id,
  })
}

export function useCreateManuscript() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => apiClient.createManuscript(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscripts'] })
    },
  })
}

export function useUpdateManuscript() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateManuscript(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manuscript', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['manuscripts'] })
    },
  })
}

export function useDeleteManuscript() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => apiClient.deleteManuscript(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscripts'] })
    },
  })
}

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, onProgress }) => apiClient.uploadFile(file, onProgress),
  })
}
