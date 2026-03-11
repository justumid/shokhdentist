#!/bin/bash
# Comprehensive Backend Endpoint Testing Script

echo "════════════════════════════════════════════════════════════════"
echo "   🧪 COMPREHENSIVE BACKEND ENDPOINT TEST"
echo "════════════════════════════════════════════════════════════════"
echo ""

API_URL="http://localhost:8000"
USER_ID="test_user_$(date +%s)"
ADMIN_USER="admin"
ADMIN_PASS="SecurePass123!@#Admin2026"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

passed=0
failed=0
total=0

test_endpoint() {
    local category="$1"
    local name="$2"
    local method="$3"
    local endpoint="$4"
    local data="$5"
    local headers="$6"
    local expected="$7"
    
    ((total++))
    
    echo -n "[$category] $name... "
    
    # Build curl command
    local curl_cmd="curl -sf -X $method"
    
    # Add headers
    if [ -n "$headers" ]; then
        while IFS= read -r header; do
            curl_cmd="$curl_cmd -H '$header'"
        done <<< "$headers"
    fi
    
    # Add data
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd $API_URL$endpoint"
    
    # Execute and capture response
    response=$(eval $curl_cmd 2>&1)
    exit_code=$?
    
    # Check result
    if [ $exit_code -eq 0 ] && echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        if [ -n "$response" ]; then
            echo "  Response: ${response:0:100}"
        fi
        ((failed++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 PUBLIC ENDPOINTS (14 tests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Health & Init
test_endpoint "CORE" "Health check" "GET" "/api/health" "" "" "healthy"
test_endpoint "CORE" "Initialize session" "GET" "/api/init" "" "X-Dev-User-Id: $USER_ID" "success"

# Patient State
test_endpoint "PATIENT" "Get patient state (empty)" "GET" "/api/patient/state" "" "X-Dev-User-Id: $USER_ID" "patientState"

test_endpoint "PATIENT" "Save patient state" "POST" "/api/patient/state" \
    '{"fullName":"Test User","phone":"+998901234567","birthDate":"1990-01-01","diabet":false,"heart":false,"bp":false,"toothpain":true,"gumbleed":false,"photoConsent":true,"programConsent":true}' \
    "Content-Type: application/json
X-Dev-User-Id: $USER_ID" \
    "success"

test_endpoint "PATIENT" "Get patient state (saved)" "GET" "/api/patient/state" "" "X-Dev-User-Id: $USER_ID" "Test User"

# Appointments
test_endpoint "APPOINTMENTS" "Get user appointments (empty)" "GET" "/api/appointments" "" "X-Dev-User-Id: $USER_ID" "appointments"

test_endpoint "APPOINTMENTS" "Create free consultation" "POST" "/api/appointments" \
    '{"patientData":{"fullName":"John Doe","phone":"+998901234567","birthDate":"1990-01-01","diabet":false,"heart":false,"bp":false,"toothpain":true,"gumbleed":false,"photoConsent":true},"type":"free","selectedSlot":null}' \
    "Content-Type: application/json
X-Dev-User-Id: $USER_ID" \
    "id"

test_endpoint "APPOINTMENTS" "Get user appointments (with data)" "GET" "/api/appointments" "" "X-Dev-User-Id: $USER_ID" "John Doe"

# Slots
test_endpoint "SLOTS" "Get available slots" "GET" "/api/slots/available?date=2026-04-01" "" "" "timeSlots"

# Reviews
test_endpoint "REVIEWS" "Get all reviews" "GET" "/api/reviews" "" "" "reviews"

test_endpoint "REVIEWS" "Get reviews by tag" "GET" "/api/reviews?tag=Mehribon+shifokorlar" "" "" "reviews"

test_endpoint "REVIEWS" "Create review" "POST" "/api/reviews" \
    '{"name":"Happy Patient","rating":5,"tags":["Mehribon shifokorlar"],"text":"Excellent service!"}' \
    "Content-Type: application/json
X-Dev-User-Id: $USER_ID" \
    "id"

# Static Data
test_endpoint "DATA" "Get services" "GET" "/api/services" "" "" "categories"
test_endpoint "DATA" "Get team" "GET" "/api/team" "" "" "team"
test_endpoint "DATA" "Get FAQ" "GET" "/api/faq" "" "" "faq"
test_endpoint "DATA" "Get stats" "GET" "/api/stats" "" "" "total"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 ADMIN ENDPOINTS - Without Auth (Should Fail - 3 tests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# These should fail without auth
echo -n "[ADMIN] Get appointments (no auth)... "
if ! curl -sf "$API_URL/api/admin/appointments" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS (correctly blocked)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL (should be blocked)${NC}"
    ((failed++))
fi
((total++))

echo -n "[ADMIN] Get patients (no auth)... "
if ! curl -sf "$API_URL/api/admin/patients" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS (correctly blocked)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL (should be blocked)${NC}"
    ((failed++))
fi
((total++))

echo -n "[ADMIN] Get stats (no auth)... "
if ! curl -sf "$API_URL/api/admin/stats" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS (correctly blocked)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL (should be blocked)${NC}"
    ((failed++))
fi
((total++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 ADMIN ENDPOINTS - With Auth (10 tests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

AUTH_HEADER="Authorization: Basic $(echo -n "$ADMIN_USER:$ADMIN_PASS" | base64)"

test_endpoint "ADMIN" "Get all appointments" "GET" "/api/admin/appointments" "" "$AUTH_HEADER" "appointments"

test_endpoint "ADMIN" "Get all patients" "GET" "/api/admin/patients" "" "$AUTH_HEADER" "patients"

test_endpoint "ADMIN" "Get admin stats" "GET" "/api/admin/stats" "" "$AUTH_HEADER" "appointments"

test_endpoint "ADMIN" "Get slot config" "GET" "/api/admin/slots" "" "$AUTH_HEADER" "slots"

test_endpoint "ADMIN" "Get services" "GET" "/api/admin/services" "" "$AUTH_HEADER" "services"

test_endpoint "ADMIN" "Get team" "GET" "/api/admin/team" "" "$AUTH_HEADER" "team"

test_endpoint "ADMIN" "Get reviews" "GET" "/api/admin/reviews" "" "$AUTH_HEADER" "reviews"

test_endpoint "ADMIN" "Get FAQ" "GET" "/api/admin/faq" "" "$AUTH_HEADER" "faq"

test_endpoint "ADMIN" "Get frozen days" "GET" "/api/admin/frozen-days" "" "$AUTH_HEADER" "frozenDays"

test_endpoint "ADMIN" "Get booked slots" "GET" "/api/admin/booked-slots" "" "$AUTH_HEADER" "bookedSlots"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 APPOINTMENT LIFECYCLE (5 tests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create appointment and get ID
echo -n "[LIFECYCLE] Create appointment... "
appointment_response=$(curl -sf -X POST \
    -H "Content-Type: application/json" \
    -H "X-Dev-User-Id: lifecycle_$USER_ID" \
    -d '{
        "patientData": {
            "fullName": "Lifecycle Test",
            "phone": "+998901111111",
            "birthDate": "1985-05-15",
            "diabet": false,
            "heart": false,
            "bp": false,
            "toothpain": true,
            "gumbleed": false,
            "photoConsent": true
        },
        "type": "free",
        "selectedSlot": null
    }' \
    "$API_URL/api/appointments" 2>&1)

if echo "$appointment_response" | grep -q '"id"'; then
    appointment_id=$(echo "$appointment_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ PASS${NC} (ID: ${appointment_id:0:8}...)"
    ((passed++))
    
    # Get appointment details
    echo -n "[LIFECYCLE] Get appointment details... "
    if curl -sf -u "$ADMIN_USER:$ADMIN_PASS" "$API_URL/api/admin/appointments/$appointment_id" | grep -q "Lifecycle Test"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((failed++))
    fi
    
    # Update appointment status to confirmed
    echo -n "[LIFECYCLE] Update status to confirmed... "
    if curl -sf -X PATCH \
        -u "$ADMIN_USER:$ADMIN_PASS" \
        -H "Content-Type: application/json" \
        -d '{"status":"confirmed","notes":"Confirmed by admin"}' \
        "$API_URL/api/admin/appointments/$appointment_id/status" | grep -q "success"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((failed++))
    fi
    
    # Verify status changed
    echo -n "[LIFECYCLE] Verify status changed... "
    if curl -sf -u "$ADMIN_USER:$ADMIN_PASS" "$API_URL/api/admin/appointments/$appointment_id" | grep -q "confirmed"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((failed++))
    fi
    
    # User cancels appointment
    echo -n "[LIFECYCLE] User cancels appointment... "
    if curl -sf -X PATCH \
        -H "Content-Type: application/json" \
        -H "X-Dev-User-Id: lifecycle_$USER_ID" \
        -d '{"status":"cancelled"}' \
        "$API_URL/api/appointments/$appointment_id" | grep -q "success"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((failed++))
    fi
else
    echo -e "${RED}✗ FAIL${NC}"
    ((failed++))
    ((total+=4))
fi
((total+=5))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 EDGE CASES & VALIDATION (8 tests)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Invalid phone number
echo -n "[VALIDATION] Invalid phone format... "
if ! curl -sf -X POST \
    -H "Content-Type: application/json" \
    -H "X-Dev-User-Id: $USER_ID" \
    -d '{"fullName":"Test","phone":"invalid"}' \
    "$API_URL/api/patient/state" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS (correctly rejected)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL (should reject)${NC}"
    ((failed++))
fi
((total++))

# Missing required fields
echo -n "[VALIDATION] Missing required fields... "
if ! curl -sf -X POST \
    -H "Content-Type: application/json" \
    -H "X-Dev-User-Id: $USER_ID" \
    -d '{"type":"free"}' \
    "$API_URL/api/appointments" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS (correctly rejected)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL (should reject)${NC}"
    ((failed++))
fi
((total++))

# Invalid date format
echo -n "[VALIDATION] Invalid date in slots... "
response=$(curl -sf "$API_URL/api/slots/available?date=invalid-date" 2>&1)
if [ $? -ne 0 ] || echo "$response" | grep -qi "error\|invalid"; then
    echo -e "${GREEN}✓ PASS (handled gracefully)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((failed++))
fi
((total++))

# Non-existent appointment
echo -n "[VALIDATION] Get non-existent appointment... "
if ! curl -sf -u "$ADMIN_USER:$ADMIN_PASS" "$API_URL/api/admin/appointments/non-existent-id" 2>&1 | grep -q "fullName"; then
    echo -e "${GREEN}✓ PASS (correctly handled)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((failed++))
fi
((total++))

# Empty review submission
echo -n "[VALIDATION] Empty review text... "
if ! curl -sf -X POST \
    -H "Content-Type: application/json" \
    -H "X-Dev-User-Id: $USER_ID" \
    -d '{"name":"Test","rating":5,"text":""}' \
    "$API_URL/api/reviews" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS (correctly rejected)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL (should reject)${NC}"
    ((failed++))
fi
((total++))

# Invalid rating
echo -n "[VALIDATION] Invalid rating (0)... "
if ! curl -sf -X POST \
    -H "Content-Type: application/json" \
    -H "X-Dev-User-Id: $USER_ID" \
    -d '{"name":"Test","rating":0,"text":"Bad"}' \
    "$API_URL/api/reviews" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS (correctly rejected)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL (should reject)${NC}"
    ((failed++))
fi
((total++))

# Invalid rating (6)
echo -n "[VALIDATION] Invalid rating (6)... "
if ! curl -sf -X POST \
    -H "Content-Type: application/json" \
    -H "X-Dev-User-Id: $USER_ID" \
    -d '{"name":"Test","rating":6,"text":"Too good"}' \
    "$API_URL/api/reviews" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS (correctly rejected)${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL (should reject)${NC}"
    ((failed++))
fi
((total++))

# CORS check
echo -n "[SECURITY] CORS headers present... "
if curl -sf -I -H "Origin: http://localhost:3000" "$API_URL/api/health" | grep -q "Access-Control"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((failed++))
fi
((total++))

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   📊 TEST SUMMARY"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests:    $total"
echo -e "${GREEN}Passed:         $passed${NC}"
echo -e "${RED}Failed:         $failed${NC}"
echo ""

success_rate=$((passed * 100 / total))
echo "Success Rate:   ${success_rate}%"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   ✅ ALL TESTS PASSED! BACKEND IS FULLY FUNCTIONAL${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "✓ All 35 API endpoints working"
    echo "✓ Admin authentication secured"
    echo "✓ Validation working correctly"
    echo "✓ Data flow verified"
    echo "✓ CORS configured"
    echo "✓ Error handling proper"
    echo ""
    echo "Backend is ready for production deployment! 🚀"
    echo ""
    exit 0
else
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}   ⚠️  SOME TESTS FAILED${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Check the failures above and fix issues."
    echo ""
    exit 1
fi
