import urllib.request
import urllib.parse
import json
import os
import pypdf
import sys

BASE_URL = "http://localhost:5000"

def run_tests():
    print("=" * 60)
    print("RUNNING COMPREHENSIVE E2E & ACCEPTANCE TESTS")
    print("=" * 60)

    # 1. Test Health Endpoint
    req = urllib.request.Request(f"{BASE_URL}/api/health")
    with urllib.request.urlopen(req) as response:
        health = json.loads(response.read().decode('utf-8'))
        assert health["status"] == "ok", "Health check failed"
        print("[PASS] Health check OK")

    # 2. Section 51: Acceptance Test Submission
    # Sample drawn 1x1 transparent PNG data URL
    sample_sig_data = (
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAA8CAYAAACnQ0lOAAAFqElEQVR42u3d"
        "13LiRhBA0ebk//+5y84Gggk2c2+kUo+23g3w7ep7g2aEEML+e53/t4AfxA8ihPgf4gfxgwgh/of4Qfwg"
        "Qoj/IX4QP4gQ4n+IH8QPIoT4H+IH8YMIIZ4Q/0OEEF+Jn4kQ4j/xMxFC/Cd+JkKI/8TPRAjxn/iZCCH+"
        "Ez8TIcR/4mcihPhP/EyEEP+Jn4kQ4j/xMxFC/Cd+JkKI/8TPRAjxn/iZCCH+Ez8TIcR/4mcihPhP/EyE"
        "EP+Jn4kQ4j/xMxFC/Cd+JkKI/8TPRAjxP8QP4gcRQvwP8YP4QYQQ/0P8IH4QIcT/ED+IH0QI8T/ED+IH"
        "EUL8D/GD+EGEEP9D/CB+ECHEE+J/iBDiK/EzEUL8J34mQoj/xM9ECPGf+JkIIf4TPxMhxH/iZyKE+E/8"
        "TIQQ/4mfiRDiP/EzEUL8J34mQoj/xM9ECPGf+JkIIf4TPxMhxH/iZyKE+E/8TIQQ/4mfiRDiP/EzEUL8"
        "D/GD+EGEEP9D/CB+ECHEE+J/"
    )

    # Build multipart boundary or json body
    submission_payload = {
        "fullName": "Test Applicant",
        "relationship": "S/o",
        "parentSpouseName": "Test Parent",
        "houseName": "Test House",
        "island": "Amini",
        "pinCode": "682552",
        "email": "test@example.com",
        "phone": "9999999999",
        "place": "Amini",
        "date": "14.10.2026",
        "signatureType": "drawn",
        "signatureData": sample_sig_data,
        "idempotencyKey": "test_idem_acceptance_001"
    }

    data_bytes = json.dumps(submission_payload).encode('utf-8')
    sub_req = urllib.request.Request(
        f"{BASE_URL}/api/submissions",
        data=data_bytes,
        headers={"Content-Type": "application/json"}
    )

    print("\nSubmitting Test Applicant objections to /api/submissions...")
    with urllib.request.urlopen(sub_req) as sub_res:
        res_data = json.loads(sub_res.read().decode('utf-8'))

    assert res_data["success"] is True, "Submission failed"
    submission_id = res_data["submissionId"]
    access_token = res_data["accessToken"]
    print(f"[PASS] Submission Created Successfully: ID = {submission_id}")

    # 3. Verify Generated PDFs Exist On Disk
    pdf_dir = os.path.join(r"C:\Users\HP\Downloads\Town and Country Planning\backend\storage\pdfs", submission_id)
    pdf1_path = os.path.join(pdf_dir, f"{submission_id}_Objection_1_Planning_Development_Board_Rules.pdf")
    pdf2_path = os.path.join(pdf_dir, f"{submission_id}_Objection_2_Chief_Town_Planner_Qualifications_Rules.pdf")
    zip_path = os.path.join(pdf_dir, f"{submission_id}_Objection_Letters.zip")

    assert os.path.exists(pdf1_path), f"Letter 1 PDF missing at {pdf1_path}"
    assert os.path.exists(pdf2_path), f"Letter 2 PDF missing at {pdf2_path}"
    assert os.path.exists(zip_path), f"ZIP missing at {zip_path}"

    pdf1_size = os.path.getsize(pdf1_path)
    pdf2_size = os.path.getsize(pdf2_path)
    zip_size = os.path.getsize(zip_path)
    print(f"[PASS] Both PDF files exist! PDF 1: {pdf1_size} bytes, PDF 2: {pdf2_size} bytes, ZIP: {zip_size} bytes")

    # 4. Inspect Text Content Inside Letter 1 PDF
    reader1 = pypdf.PdfReader(pdf1_path)
    text1 = "\n".join([page.extract_text() or "" for page in reader1.pages])
    norm_text1 = " ".join(text1.split())

    assert "Test Applicant" in norm_text1, "Letter 1 does not contain Test Applicant"
    assert "Test House" in norm_text1, "Letter 1 does not contain Test House"
    assert "Amini" in norm_text1, "Letter 1 does not contain Island Amini"
    assert "682552" in norm_text1, "Letter 1 does not contain PIN 682552"
    assert "test@example.com" in norm_text1, "Letter 1 does not contain email"
    assert "9999999999" in norm_text1, "Letter 1 does not contain phone"
    assert "Planning and Development Board" in norm_text1, "Letter 1 title mismatch"
    assert "Provision offended" in norm_text1, "Letter 1 table header mismatch"
    print(f"[PASS] Letter 1 verified with applicant info & specific Board Rules content! (Total {len(reader1.pages)} pages)")

    # 5. Inspect Text Content Inside Letter 2 PDF
    reader2 = pypdf.PdfReader(pdf2_path)
    text2 = "\n".join([page.extract_text() or "" for page in reader2.pages])
    norm_text2 = " ".join(text2.split())

    assert "Test Applicant" in norm_text2, "Letter 2 does not contain Test Applicant"
    assert "Test House" in norm_text2, "Letter 2 does not contain Test House"
    assert "Amini" in norm_text2, "Letter 2 does not contain Island Amini"
    assert "682552" in norm_text2, "Letter 2 does not contain PIN 682552"
    assert "test@example.com" in norm_text2, "Letter 2 does not contain email"
    assert "9999999999" in norm_text2, "Letter 2 does not contain phone"
    assert "Chief Town Planner Qualifications" in norm_text2, "Letter 2 title mismatch"
    assert "Rule 3(b) is ultra vires Section 3" in norm_text2, "Letter 2 specific content mismatch"
    print(f"[PASS] Letter 2 verified with SAME applicant info & specific Chief Town Planner content! (Total {len(reader2.pages)} pages)")

    # 6. Verify Content Disparity (Letter 1 != Letter 2)
    assert text1 != text2, "Critical Failure: Letter 1 and Letter 2 have identical content!"
    assert "Union Public Service Commission" in text2 and "Union Public Service Commission" not in text1, "Copy-to mismatch"
    print("[PASS] Letter 1 and Letter 2 objection contents are completely separate and distinct!")

    # 7. Test Admin Login & Authentication
    login_payload = json.dumps({"username": "admin", "password": "Admin@2026!"}).encode('utf-8')
    login_req = urllib.request.Request(
        f"{BASE_URL}/api/admin/login",
        data=login_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(login_req) as login_res:
        login_data = json.loads(login_res.read().decode('utf-8'))

    assert login_data["success"] is True, "Admin login failed"
    admin_token = login_data["token"]
    auth_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    print("[PASS] Admin authentication successful")

    # 8. Test Dashboard Stats
    dash_req = urllib.request.Request(f"{BASE_URL}/api/admin/dashboard-stats", headers=auth_headers)
    with urllib.request.urlopen(dash_req) as dash_res:
        stats = json.loads(dash_res.read().decode('utf-8'))["stats"]
        assert stats["total"] >= 1, "Total submissions count should be at least 1"
        print(f"[PASS] Dashboard stats loaded: Total = {stats['total']}, Status Counts = {stats['statusCounts']}")

    # 9. Test Submission Detail & Status Update
    detail_req = urllib.request.Request(f"{BASE_URL}/api/admin/submissions/{submission_id}", headers=auth_headers)
    with urllib.request.urlopen(detail_req) as detail_res:
        detail_data = json.loads(detail_res.read().decode('utf-8'))
        assert detail_data["submission"]["fullName"] == "Test Applicant"
        assert len(detail_data["letters"]) == 2
        print("[PASS] Admin Submission Detail retrieved with 2 distinct stored objection letters")

    # Update Status to "Under Review"
    status_payload = json.dumps({"status": "Under Review", "remarks": "Acceptance test status change"}).encode('utf-8')
    status_req = urllib.request.Request(
        f"{BASE_URL}/api/admin/submissions/{submission_id}/status",
        data=status_payload,
        headers=auth_headers,
        method="PATCH"
    )
    with urllib.request.urlopen(status_req) as status_res:
        status_res_data = json.loads(status_res.read().decode('utf-8'))
        assert status_res_data["newStatus"] == "Under Review"
        print("[PASS] Status updated to 'Under Review'")

    # Add Admin Private Note
    note_payload = json.dumps({"note": "Acceptance test verified applicant details."}).encode('utf-8')
    note_req = urllib.request.Request(
        f"{BASE_URL}/api/admin/submissions/{submission_id}/notes",
        data=note_payload,
        headers=auth_headers
    )
    with urllib.request.urlopen(note_req) as note_res:
        note_res_data = json.loads(note_res.read().decode('utf-8'))
        assert note_res_data["success"] is True
        print("[PASS] Admin private note added")

    # 10. Test Immutability: Create & Activate New Template Version
    tmpl_payload = json.dumps({
        "letterNumber": 1,
        "title": "Draft Planning Board Rules (Amended 2027)",
        "version": "2.0",
        "subject": "New Version Subject",
        "contentHtml": "<p>NEW TEMPLATE VERSION CONTENT - SHOULD NOT AFFECT HISTORICAL SUBMISSION {{FULL_NAME}}</p>",
        "activateImmediately": True
    }).encode('utf-8')

    tmpl_req = urllib.request.Request(
        f"{BASE_URL}/api/templates",
        data=tmpl_payload,
        headers=auth_headers
    )
    with urllib.request.urlopen(tmpl_req) as tmpl_res:
        tmpl_res_data = json.loads(tmpl_res.read().decode('utf-8'))
        assert tmpl_res_data["success"] is True
        print("[PASS] New Template Version 2.0 created and activated for future submissions")

    # Re-verify that historical submission LDR-2026-000001 STILL has its original Letter 1 (version 1.0)
    with urllib.request.urlopen(detail_req) as detail_res2:
        detail_data2 = json.loads(detail_res2.read().decode('utf-8'))
        sub_letter1 = detail_data2["letters"][0]
        assert sub_letter1["templateVersion"] == "1.0", "IMMUTABILITY VIOLATION: Template version was overwritten!"
        assert "NEW TEMPLATE VERSION CONTENT" not in sub_letter1["finalHtml"], "IMMUTABILITY VIOLATION: HTML was overwritten!"
        print("[PASS] IMMUTABILITY VERIFIED: Historical submission is frozen and unchanged!")

    # Reactivate original Template 1 (ID: 1) to keep the system pristine
    reactivate_req = urllib.request.Request(
        f"{BASE_URL}/api/templates/1/activate",
        headers=auth_headers,
        method="POST"
    )
    with urllib.request.urlopen(reactivate_req) as react_res:
        react_data = json.loads(react_res.read().decode('utf-8'))
        assert react_data["success"] is True
        print("[PASS] Original Template 1 reactivated for active use")

    # 11. Test Export CSV
    export_req = urllib.request.Request(f"{BASE_URL}/api/admin/export", headers=auth_headers)
    with urllib.request.urlopen(export_req) as export_res:
        csv_text = export_res.read().decode('utf-8')
        assert "Submission ID" in csv_text
        assert submission_id in csv_text
        assert "Test Applicant" in csv_text
        print("[PASS] CSV Export verified with submission data")

    # 12. Test Public Tracking Endpoint
    track_req = urllib.request.Request(f"{BASE_URL}/api/submissions/{submission_id}?token={access_token}")
    with urllib.request.urlopen(track_req) as track_res:
        track_data = json.loads(track_res.read().decode('utf-8'))
        assert track_data["submission"]["submissionId"] == submission_id
        assert len(track_data["letters"]) == 2
        print("[PASS] Public tracking with token retrieves both letters and status successfully")

    print("\n" + "=" * 60)
    print("ALL ACCEPTANCE & E2E TESTS PASSED 100% SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
