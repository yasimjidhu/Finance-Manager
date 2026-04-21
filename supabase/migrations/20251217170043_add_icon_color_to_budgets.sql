ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS icon text DEFAULT 'pricetag-outline',
ADD COLUMN IF NOT EXISTS icon_type text DEFAULT 'Ionicons',
ADD COLUMN IF NOT EXISTS color text DEFAULT '#FCA311';
