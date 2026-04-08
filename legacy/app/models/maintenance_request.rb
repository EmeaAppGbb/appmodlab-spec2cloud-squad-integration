class MaintenanceRequest < ApplicationRecord
  belongs_to :property
  belongs_to :tenant
  belongs_to :vendor, optional: true

  validates :category, :priority, :description, presence: true
  validates :category, inclusion: { in: %w[plumbing electrical hvac appliance other] }
  validates :priority, inclusion: { in: %w[low medium high emergency] }
  validates :status, inclusion: { in: %w[open assigned in_progress completed closed] }

  scope :open, -> { where(status: 'open') }
  scope :high_priority, -> { where(priority: %w[high emergency]) }

  after_create :notify_property_manager

  private

  def notify_property_manager
    # Send notification to property manager
    MaintenanceMailer.request_created(self).deliver_later
  end
end
