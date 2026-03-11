#!/bin/bash

API="http://localhost:8000"
AUTH=$(echo -n "admin:SecurePass123!@#Admin2026" | base64)

echo "Testing backend endpoints..."
echo ""

# Health
echo -n "1. Health... "
curl -sf "$API/api/health" >/dev/null && echo "✓" || echo "✗"

# Init
echo -n "2. Init... "
curl -sf -H "X-Dev-User-Id: 123" "$API/api/init" >/dev/null && echo "✓" || echo "✗"

# Patient state
echo -n "3. Patient State GET... "
curl -sf -H "X-Dev-User-Id: 123" "$API/api/patient/state" >/dev/null && echo "✓" || echo "✗"

echo -n "4. Patient State POST... "
curl -sf -X POST -H "Content-Type: application/json" -H "X-Dev-User-Id: 123" \
  -d '{"fullName":"Test"}' "$API/api/patient/state" >/dev/null && echo "✓" || echo "✗"

# Appointments
echo -n "5. Get Appointments... "
curl -sf -H "X-Dev-User-Id: 123" "$API/api/appointments" >/dev/null && echo "✓" || echo "✗"

# Admin (with auth)
echo -n "6. Admin Appointments... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/appointments" >/dev/null && echo "✓" || echo "✗"

echo -n "7. Admin Patients... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/patients" >/dev/null && echo "✓" || echo "✗"

echo -n "8. Admin Stats... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/stats" >/dev/null && echo "✓" || echo "✗"

echo -n "9. Admin Services... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/services" >/dev/null && echo "✓" || echo "✗"

echo -n "10. Admin Team... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/team" >/dev/null && echo "✓" || echo "✗"

echo -n "11. Admin Reviews... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/reviews" >/dev/null && echo "✓" || echo "✗"

echo -n "12. Admin FAQ... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/faq" >/dev/null && echo "✓" || echo "✗"

echo -n "13. Admin Frozen Days... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/frozen-days" >/dev/null && echo "✓" || echo "✗"

echo -n "14. Admin Booked Slots... "
curl -sf -H "Authorization: Basic $AUTH" "$API/api/admin/booked-slots" >/dev/null && echo "✓" || echo "✗"

# CORS
echo -n "15. CORS Headers... "
curl -sI -H "Origin: http://localhost:3000" "$API/api/health" | grep -q "access-control" && echo "✓" || echo "✗"

echo ""
echo "Done!"

# Test PDF questionnaire download
echo -n "16. Download Questionnaire... "
PDF_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/appointments/apt_test_12345/questionnaire" \
  -u "admin:SecurePass123!@#Admin2026" \
  -o /tmp/test_questionnaire.pdf)
HTTP_CODE=$(echo "$PDF_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ] && [ -f "/tmp/test_questionnaire.pdf" ]; then
  FILE_TYPE=$(file /tmp/test_questionnaire.pdf | grep -c "PDF document")
  if [ "$FILE_TYPE" -gt 0 ]; then
    echo "✓"
  else
    echo "✗"
  fi
else
  echo "✗"
fi

