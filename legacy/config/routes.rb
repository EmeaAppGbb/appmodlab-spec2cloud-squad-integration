Rails.application.routes.draw do
  resources :properties
  resources :tenants do
    resources :applications, controller: 'tenant_applications'
  end
  resources :leases
  resources :maintenance_requests, path: 'maintenance/requests'

  root 'properties#index'
end
