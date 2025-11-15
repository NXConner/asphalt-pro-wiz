-- STORAGE & ALERTS ENHANCEMENT - CORRECTED

-- Part 1: Storage RLS policies for authenticated users
CREATE POLICY "employee_docs_user_select" ON storage.objects
FOR SELECT USING (bucket_id = 'employee-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "employee_docs_user_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'employee-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "employee_docs_user_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'employee-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "employee_docs_user_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'employee-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "fleet_reg_cards_user_select" ON storage.objects
FOR SELECT USING (bucket_id = 'fleet-reg-cards' AND auth.uid() IS NOT NULL);

CREATE POLICY "fleet_reg_cards_user_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fleet-reg-cards' AND auth.uid() IS NOT NULL);

CREATE POLICY "fleet_reg_cards_user_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'fleet-reg-cards' AND auth.uid() IS NOT NULL);

CREATE POLICY "fleet_reg_cards_user_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'fleet-reg-cards' AND auth.uid() IS NOT NULL);

CREATE POLICY "receipts_user_select" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "receipts_user_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "receipts_user_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "receipts_user_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

CREATE POLICY "fleet_images_user_select" ON storage.objects
FOR SELECT USING (bucket_id = 'fleet-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "fleet_images_user_insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fleet-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "fleet_images_user_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'fleet-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "fleet_images_user_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'fleet-images' AND auth.uid() IS NOT NULL);

-- Part 2: Enhanced alerts validation (without vehicle check - will add when schema is known)
DROP POLICY IF EXISTS "alerts_insert_validated" ON alerts;

CREATE POLICY "alerts_insert_validated" ON alerts
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    employee_id IS NULL 
    OR employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  )
);

-- Part 3: Alerts UPDATE/DELETE policies
CREATE POLICY "alerts_update_user" ON alerts
FOR UPDATE USING (
  created_by = auth.uid()
  OR employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "alerts_delete_user" ON alerts
FOR DELETE USING (
  created_by = auth.uid()
  OR employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);