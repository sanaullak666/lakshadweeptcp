# Build exact HTML content for Objection 3
import re

html_parts = []

html_parts.append("""<div class="legal-doc" style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.35; color: #000;">
  <p style="margin: 0 0 2pt 0; font-weight: bold;">From:</p>
  <p style="margin: 0 0 2pt 0;">{{FULL_NAME}}</p>
  <p style="margin: 0 0 2pt 0;">{{RELATIONSHIP}} {{PARENT_SPOUSE_NAME}}</p>
  <p style="margin: 0 0 2pt 0;">{{HOUSE_NAME}}, {{ISLAND}}, Union Territory of Lakshadweep – {{PIN_CODE}}</p>
  <p style="margin: 0 0 2pt 0;">Email: {{EMAIL}}</p>
  <p style="margin: 0 0 14pt 0;">Mobile Phone: {{PHONE}}</p>

  <p style="margin: 0 0 2pt 0; font-weight: bold;">To:</p>
  <p style="margin: 0 0 2pt 0;">The Director (Urban Development)</p>
  <p style="margin: 0 0 2pt 0;">Department of Urban Development, Union Territory of Lakshadweep Administration</p>
  <p style="margin: 0 0 14pt 0;">Kavaratti – 682 555 (email: lak-ud@utl.gov.in)</p>

  <p style="margin: 0 0 6pt 0;"><strong>Mode:</strong> By email and by registered post with acknowledgment due</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;"><strong>Subject:</strong> Objections and suggestions under Section 153(7) of the Lakshadweep Town and Country Planning and Development Regulation, 2026 (Regulation No. 8 of 2026) to the draft Lakshadweep Town and Country Planning and Development (Planning and Development Authority) Rules, 2026 – F.No.16/1/2022-UD(Vol.1)(3) –objection – reg.</p>
  <p style="margin: 0 0 14pt 0; text-align: justify;"><strong>Reference:</strong> Public Notice for Pre-Legislative Consultation, F. No.16/1/2022-UD(Vol.1)(3) dated 18.09.2026, issued by the Director (Urban Development), inviting objections within 30 days.</p>

  <p style="margin: 0 0 8pt 0;">Sir,</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">1. The undersigned is a resident of Lakshadweep and a member of a Scheduled Tribe notified for this Union Territory. The undersigned had no part in framing the draft Rules and submits these objections as an aggrieved party, an Islander who is affected by the Rules, in response to the Public Notice and within the 30 days it allows.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">2. The draft Rules govern the Planning and Development Authorities. These Authorities prepare the land use map and register, the Master Plan and town planning schemes for each planning area; grant or refuse permission for every building operation, including re-roofing; levy development charges; and evict occupants (Sections 26, 29, 32, 48, 90 and 115). The draft Rules would unilaterally decide how every islander's land is recorded, charged, regulated if notified as such.</p>

  <p style="margin: 0 0 14pt 0; text-align: justify;">3. In these objections, &ldquo;the Regulation&rdquo; means the Lakshadweep Town and Country Planning and Development Regulation, 2026 (Regulation No. 8 of 2026); &ldquo;Section&rdquo; means a section of the Regulation; &ldquo;the draft Rules&rdquo; means the draft Rules named in the subject; and &ldquo;the Pandaram judgment&rdquo; means the judgment of the High Court of Kerala dated 05.08.2026 (2026 KLT OnLine 2085).</p>

  <p style="margin: 16pt 0 8pt 0; font-weight: bold; font-size: 12pt; text-align: left; page-break-after: avoid;">Summary of Objections</p>
  <p style="margin: 0 0 8pt 0; text-align: justify;">The draft Rules should not be notified in their present form. Several provisions exceed the rule-making power in Section 153, it also contradict the sections they claim to implement and several rules are arbitrary infringing Articles 14, 21 and 300A of the Constitution of India.</p>

  <p style="margin: 0 0 6pt 0; text-align: justify;">(i) Consultation is defective as the National Commission for Scheduled Tribes and the elected Panchayats were not consulted.</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(ii) Rules 3 and 5 gives the Administrator authority to end the term of, remove, or replace the members nominated by Gram Panchayats, contrary to Sections 24(3)(d) and Sections -25(3).</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(iii) Rule 6 allows decisions without a quorum after a ten-minute adjournment, and keeps minutes in English, closed to the public.</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(iv) Rule 21 creates a summary-eviction power over &ldquo;any land&rdquo; on the Authority's opinion. Section 90 confines summary eviction to persons not entitled to occupy land under a preliminary town planning scheme.</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(v) Rules 19, 20 and 24 cut down statutory rights. Rule 19 can bar compensation claim under Section 52 before the Section 51 process ends. Rule 24 fixes development charges that Section 115 specifies to each Authority within prescribed limits. Rule 20 exempts Government land and gives no relief islanders' homes.</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(vi) Rule 11 and Form A classify island land in mainland categories (heavy and noxious industry, pastures, staple crops). They have no place for coconut holdings, Pandaram land, customary commons, beaches, lagoons or reefs, or for who owns the land. Under Section 30(6), the published map becomes conclusive.</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(vii) Rule 16 and Form B require plans signed by an architect &ldquo;registered with&rdquo; the Authority. The said licensing power is not conferred by the Regulation and burden every house construction and re-roofing.</p>
  <p style="margin: 0 0 14pt 0; text-align: justify;">(viii) The draft Rules prescribe every coercive procedure but omit the protective ones the Regulation requires to be prescribed. These include continuance of existing use under Section 46, appeal periods under Sections 56(2) and 58(2), compensation claims under Sections 54 and 58(4), and the inquiry before demolition under Section 53(4).</p>

  <p style="margin: 16pt 0 8pt 0; font-weight: bold; font-size: 12pt; text-align: left; page-break-after: avoid;">Preliminary objections.</p>
  <p style="margin: 0 0 8pt 0; text-align: justify;"><strong>4. The consultation does not meet the Regulation's own standard.</strong></p>
  <ul style="margin: 0 0 10pt 0; padding-left: 20pt; list-style-type: disc;">
    <li style="margin-bottom: 6pt; text-align: justify;">Section 153(7) makes previous publication a condition of the rule-making power: in the Official Gazette, and &ldquo;in such other manner as may be directed by the Government&rdquo;. The 30 days should run from the date of Gazette publication, and that date should be disclosed.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">The Regulation requires community participation &ldquo;by publishing reports in local languages so that community can understand and participate&rdquo; (Section 26(1)(h)). It requires every public notice to be &ldquo;widely made known in the locality&rdquo; by affixing copies in public places, beat of drum or local newspaper (Section 127). The draft Rules were published only in English, and objections are accepted only by email.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">The Pre-Legislative Consultation Policy, 2014, adopted by the Committee of Secretaries on 10.01.2014, applies to subordinate legislation. It requires a brief justification, the essential elements, the financial implications and an estimate of the impact on the environment, fundamental rights, and the lives and livelihoods of the people affected (paragraph 2). It requires publicity that reaches the affected group (paragraph 3) and an explanatory note in simple language (paragraph 5). None accompanied the draft Rules.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">In <em>Sajeev Sebastian v. Union of India</em> (2024:KER:67376), the High Court of Kerala directed publication of a Malayalam translation of a draft notification and allowed 60 days from that publication for objections. In <em>Vikrant Tongad v. Union of India</em> (W.P.(C) No. 3747 of 2020, Delhi High Court, 30.06.2020), the draft EIA Notification, 2020 was directed to be translated into the languages of the Eighth Schedule. Transparency in making subordinate legislation was stressed in <em>Cellular Operators Association of India v. TRAI</em>, (2016) 7 SCC 703.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">Article 350 entitles every person to submit a representation in any language used in the Union. An English, email-only process denies that in practice to most islanders as many of whom have no reliable internet access.</li>
  </ul>

  <p style="margin: 0 0 10pt 0; text-align: justify;"><strong>5. The National Commission for Scheduled Tribes and the elected Panchayats were not consulted.</strong> About 95% of the people of Lakshadweep are Scheduled Tribes (Census 2011). Rules that decide who sits on the planning bodies, how tribal land is recorded and charged, and how occupants are evicted are &ldquo;major policy matters affecting Scheduled Tribes&rdquo;, on which Article 338A(9) requires the Commission to be consulted. Part IX of the Constitution applies to Union Territories (Article 243L); the Gram Panchayats are the &ldquo;local authority&rdquo; under Section 2(18); and land improvement, land consolidation and rural housing are Eleventh Schedule subjects (items 2 and 10). The District Panchayat, all ten Village (Dweep) Panchayats and the Commission should be consulted before the draft Rules are finalised.</p>

  <p style="margin: 0 0 10pt 0; text-align: justify;"><strong>6. The draft Rules ignore the Pandaram judgment.</strong> By the Pandaram judgment, the High Court of Kerala held that persons in occupation of Pandaram land before 1965, and their legal heirs, are lawful owners. It held that the Administration had no power to treat such land as Government land and evict the occupants, and directed occupancy certificates to be issued. The draft Rules do not refer to it. The land use register (Form A) has no column for owner or tenure, and Rule 21 allows eviction of anyone the Authority thinks is in &ldquo;unauthorized occupation&rdquo;. The Rules should contain an express saving clause: nothing in them shall be used to treat as unauthorised, or to evict, an occupant whose title or occupancy is protected by the Pandaram judgment, by the Laccadive, Minicoy and Amindivi Islands (Protection of Scheduled Tribes) Regulation, 1964, or by the land revenue and tenancy law of the islands.</p>

  <p style="margin: 0 0 10pt 0; text-align: justify;"><strong>7. The ecological safeguards of the Regulation are given no effect.</strong> The Regulation requires carrying capacity studies (Sections 8(2)(j) and 26(1)(i)); zoning suited to islands four to six metres above mean sea level, backed by soil and geotechnical investigation (Section 33(1)(b)); and statutory clearances and conformity with the Integrated Island Management Plan (Section 33(1)(a)(ix) and (d)). The said Plan was prepared under the directions of the Supreme Court in <em>Union Territory of Lakshadweep v. Seashells Beach Resort</em> (Civil Appeal Nos. 4625&ndash;4626 of 2012). The Island Coastal Regulation Zone Notification, 2019 and the EIA Notification, 2006 also apply. The draft Rules give none of these requirements a form, a step or a check.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;"><strong>8. The draft Rules are copied from a mainland template without application of mind.</strong> For example:</p>
  <ul style="margin: 0 0 10pt 0; padding-left: 20pt; list-style-type: disc;">
    <li style="margin-bottom: 6pt; text-align: justify;">Rule 4(iii) refers to &ldquo;sub-rules (1) and (2)&rdquo;; Rule 4 has clauses (i) to (iv).</li>
    <li style="margin-bottom: 6pt; text-align: justify;">Rule 6(ii) says &ldquo;no receipt of such a notice by any member shall invalidate the proceedings&rdquo;, the opposite of what was presumably meant.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">Rule 14 runs time &ldquo;from the date of its submission to the Planning and Development Authority under sub-section (5) of section 36&rdquo;. Section 36(5) is the Authority's own consideration of the Committee's report. Hence Rule 14 is erroneous</li>
    <li style="margin-bottom: 6pt; text-align: justify;">Rule 20(a) exempts plots reserved &ldquo;in the Development Plan&rdquo;, an instrument the Regulation does not stipulate. Rule 20(b) exempts land of &ldquo;any State Government&rdquo;.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">Form B cites &ldquo;rule 18&rdquo; for development permission instead of Rule 16 which is addressed to &ldquo;The Planning Authority&rdquo;.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">Rule 29 applies the CCS (Pension) Rules, 1972, which were replaced by the CCS (Pension) Rules, 2021, and ignores the National Pension System that governs Central entrants since 2004.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">Rule 31 levies a daily penalty &ldquo;after conviction&rdquo;; Section 153(3) says &ldquo;after the first such contravention&rdquo;. The penalties under the Regulation are civil, adjudicated under Section 138. Hence Rule 31 is erroneous.</li>
  </ul>
  <p style="margin: 0 0 14pt 0; text-align: justify;">Rules that erroneously describe the Regulation show non-application of mind.</p>

  <p style="margin: 16pt 0 8pt 0; font-weight: bold; font-size: 12pt; text-align: left; page-break-after: avoid;">Objections to specific rules</p>
  <p style="margin: 10pt 0 6pt 0; font-weight: bold; font-size: 12pt; text-align: left; page-break-after: avoid;">I. Membership, meetings and staff (Rules 3 to 10)</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">9. Under Section 24(3), an Authority consists of a chairperson appointed by the Administrator, the Chief Executive Officer of the District Panchayat (ex officio), a Town Planning Officer appointed by the Administrator as Member Secretary, representatives nominated by the Grama Panchayats from among their members, and two experts co-opted by the others. The Grama Panchayath nominees are the only elected voice. The draft Rules make their seats removable at will.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">10. <strong>Rule 3(i) &ndash; termination at will, and a term for ex officio members (ultra vires Sections 24(3)(d), 25(1) and 25(3)).</strong> The bracketed words &ldquo;[Unless the term of office is terminated earlier by the Administrator]&rdquo; arbitrary allow the Administrator end any member's term without a ground, a notice or a hearing. Section 25(1) and Section 153(2)(viii) allow the Rules to fix &ldquo;the term of office and the conditions of service&rdquo;, not to make office terminable at pleasure. The words also contradict Rule 3(ii), which at least requires a show-cause notice. Rule 3(i) applies to &ldquo;the Chairperson and members&rdquo;, which by Rule 2(v) includes the Town Planning Officer. Section 25(1) and Section 153(2)(viii) expressly exclude the Town Planning Officer, and an ex officio member's seat follows the office, not a term. The proviso then lets the Administrator extend terms to one year at a time, without limit.<br>
  <em>Amendment sought:</em> delete the bracketed words; exclude ex officio members and the Town Planning Officer from Rule 3(i). A Gram Panchayat nominee should hold office co-terminously with membership of the Panchayat, subject to recall by it. Experts should have a fixed two-year term, renewable only by fresh co-option.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">11. <strong>Rule 3(ii) &ndash; removal of Gram Panchayat nominees by the Administrator.</strong> Section 24(3)(d)(i) gives the Gram Panchayat the right to nominate its representative, and Section 25(3), the right to fill a vacancy in that seat. Neither Section 25 nor Section 153(2)(viii) confers a power of removal. Rule 3(ii) allows the Administrator remove that nominee on his &ldquo;opinion&rdquo;, including &ldquo;for any other good and sufficient reason&rdquo;, without the inquiry and charges that Section 71(2) guarantees even to a Town Planning Officer.<br>
  <em>Amendment sought:</em> delete Rule 3(ii) for Gram Panchayat nominees, whose removal should lie with the nominating Panchayat. For others, removal only on stated grounds after an inquiry by a retired judicial officer.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">12. <strong>Rule 5 &ndash; every casual vacancy filled by the Government (contrary to Sections 24(3)(e) and 25(3)).</strong> Section 25(3) provides that a vacancy is filled &ldquo;by fresh appointment by the Government, or by nomination by the local authority concerned, as the case may be&rdquo;. The experts are co-opted under Section 24(3)(e). Rule 5 says every vacancy &ldquo;shall be filled by the Government&rdquo;. The conflict with Section 25(3) is direct, and the Rule must yield.<br>
  <em>Amendment sought:</em> reproduce Section 25(3): a Gram Panchayat seat to be filled by that Panchayat's nomination, an expert's seat by co-option, and only the Government's own appointees by the Government.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">13. <strong>Rule 3(iv) &ndash; conflict of interest.</strong> The proviso exempts shareholders from the duty to disclose an interest. An Authority is a body corporate that can acquire, hold and dispose of land and enter into contracts (Section 24(2)), and can sell up to 15% of scheme land for residential, commercial or industrial use (Section 60(4)(k)(i)(D)). A member holding shares in a resort or real estate company concerned in a proposal is &ldquo;not deemed&rdquo; interested.<br>
  <em>Amendment sought:</em> delete the shareholder proviso; extend the disclosure duty to interests of relatives and to persons associated under Rule 7; publish a register of interests.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">14. <strong>Rule 4 &ndash; a chairperson dependent on the Administrator.</strong> The chairperson receives an honorarium of Rs. 500 a month. Other terms are those &ldquo;specified in his order of appointment&rdquo;, and a Government servant chairperson serves on terms the Government sets &ldquo;from time to time&rdquo;. The draft Rules prescribe no qualification for the post. With Rule 3(i), the chairperson is in practice a serving officer holding office at the Administrator's pleasure.<br>
  <em>Amendment sought:</em> qualifications for the chairperson (standing in public life or planning, residence in the planning area), a fixed term, and removal only after inquiry.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">15. <strong>Rule 6 &ndash; meetings.</strong></p>
  <ul style="margin: 0 0 8pt 0; padding-left: 20pt; list-style-type: disc;">
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Time and place, Rule 6(i).</strong> Section 153(2)(x) requires the Rules themselves to prescribe the &ldquo;time and places&rdquo; of meetings. Rule 6(i) sub-delegates the same to Chairperson, when the Regulation does not authorise.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Notice, Rule 6(ii).</strong> The clause reads &ldquo;no receipt of such a notice by any member shall invalidate the proceedings&rdquo; needs correction. With Rule 3(iii)(d), which ends membership after absence from three consecutive meetings, a member can lose the seat for meetings never notified. This will expose the member to a real risk where inter-island travel stops in the monsoon.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Quorum, Rule 6(iii).</strong> An Authority for a planning area with one Gram Panchayat has about six members, so the quorum is three. After a ten-minute adjournment, &ldquo;not requiring a quorum&rdquo;, the Chairperson and the Town Planning Officer, both appointed by the Administrator, could adopt the land use map (Section 30(4)), finalise the Master Plan (Section 36(5)), publish a town planning scheme (Section 60) or order an eviction (Rule 21). Section 143(2) then cures every defect once the minutes are signed.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Minutes, Rule 6(v).</strong> They are to be kept in English and open only to members. Section 26(1)(h) makes community participation through local-language publication a statutory function of the Authority.</li>
  </ul>
  <p style="margin: 0 0 8pt 0; text-align: justify;"><em>Amendment sought:</em> the Rules to fix a regular meeting schedule; adjourned meetings on a later day with fresh notice; for any decision on the land use map, the Master Plan, a scheme or an eviction, the presence of at least one Gram Panchayat nominee; agenda and minutes in Malayalam (Mahl for Minicoy) and English, published on the island within seven days to be incorporated.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">16. <strong>Rule 7 &ndash; association of outside persons.</strong> An Authority may associate &ldquo;any Institution / organization / person&rdquo; whose advice it considers necessary. There are no criteria, no published reasons, and no conflict-of-interest declaration, because Rule 3(iv) binds only members. Rule 7(iii) fixes travelling and daily allowance only for non-official residents of Lakshadweep; the terms for everyone else are left to the appointment letter, with no ceiling. Such persons can shape a Master Plan without any accountability.<br>
  <em>Amendment sought:</em> Association only by resolution recording reasons; publish terms of engagement; a declaration that the person has had no engagement with any developer, tourism operator or contractor in the Union Territory in the preceding three years and will take none for three years after to be taken; island-specific work should be made only with the concurrence of the Gram Panchayat. Holders of local knowledge (fishermen's cooperatives, traditional community leaders, women's self-help groups) should be allowed to participate on the same terms.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">17. <strong>Rule 8 &ndash; staff left to the Administrator's approval (abdication of the rule-making function).</strong> Section 28(1) allows the Authority to appoint staff &ldquo;subject to such control and restrictions, as may be prescribed&rdquo;. Section 28(2) requires salaries and service conditions to be &ldquo;prescribed&rdquo; (Section 153(2)(xi) and (xii)). Rule 8 prescribes nothing. It leaves the number, designations, qualifications, pay and method of recruitment to whatever the Administrator approves, and makes no provision for reservation or local preference.<br>
  <em>Amendment sought:</em> a prescribed staffing pattern and method of recruitment, with the reservation and local preference for Scheduled Tribes of Lakshadweep applicable in the Union Territory, and a requirement of proficiency in Malayalam or Mahl for posts dealing with the public to be incorporated.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">18. <strong>Rule 10(v) &ndash; the Member Secretary may &ldquo;withhold any payment&rdquo;.</strong> No ground, no time limit, and only after-the-event approval are required. The Authority's payments include statutory compensation to landholders (Sections 52(3), 54(3), 58(4), 65(3), 96, 105 and 107). Discretion to withhold them violates Articles 14 and 300A.<br>
  <em>Amendment sought:</em> exclude statutory compensation, rehabilitation payments and refunds from Rule 10(v); require written grounds, intimation to the payee, and placement before the Authority within 30 days.</p>

  <p style="margin: 16pt 0 6pt 0; font-weight: bold; font-size: 12pt; text-align: left; page-break-after: avoid;">II. Land use, plans, permissions, charges and eviction (Rules 11 to 25)</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">19. <strong>Rule 11 and Form A &ndash;.</strong> This record matters more than any other. Once the map and register are published in the Gazette, that publication is &ldquo;conclusive proof that the map and register have been duly prepared and adopted&rdquo; (Section 30(6)). From the Master Plan notice, every land use must conform (Section 46). Land shown as built-up or vacant is the natural target of town planning and land pooling schemes (Sections 33(2)(c) and 60(3)).</p>
  <ul style="margin: 0 0 8pt 0; padding-left: 20pt; list-style-type: disc;">
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Mainland categories.</strong> The table lists Extensive, Heavy and Noxious Industries, Broadcasting Stations, Gas Works, Cinemas, Opera Houses, Market Gardens, Staple Crops, and Grazing Land and Pastures. Heavy and noxious industry has no place on coral islands governed by the Island Coastal Regulation Zone Notification, 2019 and the Integrated Island Management Plan, and its presence in the classification invites future zoning.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">There is no category for coconut cultivation, the main land use and livelihood of the islands. Nor is there one for family homestead (tharavad) compounds, or for Pandaram holdings. Customary commons are missing: boat landing and hauling grounds, net-mending and fish-drying yards, and coconut-drying yards (kalam). So are mosques, dargahs and burial grounds as community assets. Beaches, lagoons, reefs, sand dunes and fresh-water recharge areas are absent, though the Regulation itself requires them to be identified (Sections 11(2)(f), (g) and (i) and 33(1)(a)(ix) and (xiv)). &ldquo;Vacant&rdquo; is defined only as &ldquo;partly built but unoccupied&rdquo;.</li>
    <li style="margin-bottom: 6pt; text-align: justify;">Form A records land use but not land rights. Its columns are survey number, area, sub-division, predominant use, number, storeys, age, type and condition of structures, water, electricity and remarks. There is no column for owner or occupier, tenure (private, Pandaram or Government), basis of occupation, coastal regulation zone category, or customary rights of others such as access to the shore. The register will capture use while erasing who holds the land and by what right, which are exactly the facts the Pandaram judgment protects.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Procedure.</strong> Section 30 provides one public notice and 30 days for objections. The draft Rules add nothing to materialise the same for islanders.</li>
  </ul>
  <p style="margin: 0 0 8pt 0; text-align: justify;"><em>Amendment sought:</em> an island-specific classification that adds the categories above and drops heavy, extensive and noxious industry. Form A should add columns for owner or occupier, tenure, basis of occupation, coastal regulation zone category and customary rights. Each recorded holder should receive individual notice in Malayalam or Mahl, with the draft entries displayed at the Gram Panchayat office, hearings held on the island under Section 30(3), and a free copy of the holder's entries.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">20. <strong>Rule 12 &ndash; Master Plan form dilutes Section 33.</strong> Section 33(1) says what a Master Plan &ldquo;shall&rdquo; contain. Rule 12(ii) asks the index map to show those particulars only &ldquo;as may be appropriate to the Master Plan&rdquo;, turning a mandate into an option. The written statement under Rule 12(iv) covers surveys, analysis, proposals and stages. It omits the carrying capacity study (Sections 8(2)(j) and 26(1)(i)), the soil and geotechnical investigation (Section 33(1)(b)), the financial implications of each stage (Section 33(1)(c)), the statutory clearances and conformity with the Integrated Island Management Plan (Section 33(1)(d)), and the record of consultation with Gram Panchayats (Section 32). It also omits any assessment of the effect on Scheduled Tribe households and a local-language summary (Section 26(1)(h)).<br>
  <em>Amendment sought:</em> delete &ldquo;as may be appropriate&rdquo;; make each item above a mandatory annexure to the Master Plan.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">21. <strong>Rules 13 to 15 &ndash; up to 540 days with no consequence, while landholders are frozen.</strong> Each Rule gives 180 days, so the three stages can take up to 540 days. Meanwhile, from the date of the notice under Section 36(1), every land use must conform to a Master Plan not yet approved (Section 46), so, longer the Government takes, the longer owners are frozen. Rule 14 also misreads Section 36(5), and the companion draft Board Rules allow only 90 days for the Government's decision on a Regional Plan for the whole Union Territory.<br>
  <em>Amendment sought:</em> shorter periods; and, until the Master Plan is approved, applications for permission to be decided on the existing use and the Regulation, not on a draft the owner cannot see in final form.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">22. <strong>Rule 16 and Form B &ndash; a licensing regime for architects, and a burden on every house.</strong></p>
  <ul style="margin: 0 0 8pt 0; padding-left: 20pt; list-style-type: disc;">
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>No power to license architects.</strong> The Note to Rule 16 requires plans to be signed by &ldquo;the architect registered with the Planning and Development Authority&rdquo;, with a registration number &ldquo;allotted by&rdquo; it. The Regulation creates no such registration, and Section 153(2)(xxii) covers only the form, particulars, documents and plans of an application. Architects are registered under the Architects Act, 1972. Form B itself speaks of a &ldquo;Licensed Architect / Engineer&rdquo;.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>The burden on islanders.</strong> &ldquo;Building operation&rdquo; includes &ldquo;roofing or re-roofing&rdquo; (Section 2(6)(ii)). A fisherman re-roofing his house would need plans in quadruplicate to a scale of 1:500, showing floor area ratio and every building within 15 metres, signed by an architect registered with the Authority.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Nothing for the Government.</strong> Section 48(2) requires Government departments to furnish &ldquo;such documents and plans, as may be prescribed&rdquo; (Section 153(2)(xxiii)). The draft Rules prescribe none. Citizens get Form B; the Government has nothing.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>No consequence for delay.</strong> Section 48(8) requires disposal within three months. The draft Rules give no remedy, though the Regulation itself specifies deemed permission granted on delay in scheme areas (Section 70(3)) and deemed appeals allowed (Section 49(3)). The manner of communicating orders under Section 48(7) is not prescribed at all.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>A live example.</strong> By Show Cause Notice F.No.35/7/2021-DC LAND(AGTI) dated 21.09.2026, the repair of an ancestral home in Survey No. 819/16, Agatti, has been stopped, citing an order of the Additional District Magistrate dated 14.03.2026. The Rules must protect the repair of existing homes, not multiply the obstacles to it.</li>
  </ul>
  <p style="margin: 0 0 8pt 0; text-align: justify;"><em>Amendment sought:</em> delete the requirement of registration with the Authority and accept any architect or engineer registered under the law applicable to that profession. A one-page form, with no architect, should cover repair, re-roofing and reconstruction of an existing dwelling within its footprint, and new dwellings up to a specified floor area. Applications should be accepted offline at Gram Panchayat offices as well as online (Section 48(1) permits both). Permission should be deemed granted if not refused within three months. Documents for Government departments should be prescribed under Section 48(2).</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">23. <strong>Rules 17 and 25 &ndash; appeals.</strong> An appeal to the Board costs Rs. 500, with no waiver for Scheduled Tribe or below-poverty-line appellants. No place of hearing or language is specified, and the deemed allowance of appeals not decided in three months (Section 49(3)) is not reflected.<br>
  <em>Amendment sought:</em> fee waiver for Scheduled Tribe and below-poverty-line appellants; hearing on the appellant's island or by video; proceedings in Malayalam or Mahl on request; and a statement of the Section 49(3) to be considered in the order sheet.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">24. <strong>Rule 19 &ndash; a 90-day bar that defeats Section 52(1) (ultra vires).</strong> Section 52(1) gives a compensation claim to an owner who &ldquo;had not served an acquisition notice under section 51, or if he had served such notice and the same had not been confirmed&rdquo;. An acquisition notice may be served within three months of the appeal order (Section 51(1)), and the Government has up to a year to decide it (Section 51(5)). Rule 19 requires the compensation claim within 90 days of the appeal order. An owner whose acquisition notice is refused after, say, eight months is already time-barred, because the time ran out while the Government was deciding. A rule cannot take away a right the Regulation gives. The time for refusing an offer of compensation under Section 52(4) (Section 153(2)(xxviii)) is not prescribed at all.<br>
  <em>Amendment sought:</em> 90 days from the appeal order, or from the order refusing to confirm the acquisition notice, whichever is later; and a prescribed period under Section 52(4).</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">25. <strong>Rules 20 and 24 &ndash; development charges.</strong></p>
  <ul style="margin: 0 0 8pt 0; padding-left: 20pt; list-style-type: disc;">
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Rule 24 usurps the Authority's function (ultra vires Section 115).</strong> Section 115(1) gives each Authority, with the Government's previous sanction, the power to levy development charges by notification &ldquo;at the rates specified from time to time&rdquo;, with &ldquo;different rates ... for different parts of the planning area&rdquo;. Section 115(3) and Section 153(2)(lxiii) allow the Rules to prescribe only the &ldquo;maximum and minimum&rdquo; charges and the &ldquo;classification&rdquo;. Rule 24 fixes the actual rates, in one schedule, for every Authority. That removes the flexibility under Section 115(1) provides, for example lower rates for traditional settlements.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Mainland densities.</strong> The floor area ratio bands run up to 2.50, which assumes densities at odds with Section 33(1)(b) and the Integrated Island Management Plan.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>A presumption against the owner.</strong> The proviso to Rule 24(i) presumes the whole plot is &ldquo;put to use&rdquo; unless the owner proves otherwise. A family with a large coconut holding and one house should pay on the entire holding.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Exemptions only for Government.</strong> Rule 20 exempts plots reserved in a non-existent &ldquo;Development Plan&rdquo; and land of the Central, State and Union Territory Governments and local authorities, which Section 115(4) already exempts. Nothing is exempt for islanders: not a family dwelling, a repair, reconstruction after a storm or erosion, a fishermen's shed or a coconut-drying yard. Section 115(5) and Section 153(2)(lxiv) exist precisely to provide such exemptions. Restricting islanders while exempting Government works (Sections 16 and 17(1), the proviso to Section 47, and Sections 70(11), 91(5) and 115(4)) is unequal treatment without rational basis (Article 14).</li>
  </ul>
  <p style="margin: 0 0 8pt 0; text-align: justify;"><em>Amendment sought:</em> replace Rule 24 with maximum and minimum charges and a classification, the actual rates to be notified by each Authority after a public hearing. Delete the presumption in Rule 24(i). Add exemptions for dwellings of Scheduled Tribe families up to a stated floor area, for repair and reconstruction within the existing footprint, for reconstruction after natural calamity, and for traditional livelihood structures.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">26. <strong>Rule 21 &ndash; summary eviction from &ldquo;any land&rdquo; (ultra vires Section 90; violates Articles 14, 21 and 300A).</strong></p>
  <ul style="margin: 0 0 8pt 0; padding-left: 20pt; list-style-type: disc;">
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Beyond Section 90.</strong> Section 90 provides that, once a preliminary town planning scheme comes into force, &ldquo;any person continuing to occupy any land which he is not entitled to occupy under the preliminary scheme&rdquo; shall be summarily evicted &ldquo;in accordance with such procedure, as may be prescribed&rdquo;. Section 153(2)(lvi) authorises only that procedure. Rule 21(1) instead applies whenever the Authority &ldquo;is of the opinion that any person is in unauthorized occupation of any land&rdquo;, with no reference to a preliminary scheme. It creates a free-standing power to evict from any land in the planning area, including land the Administration claims as its own, such as Pandaram land. A rule cannot create a power the Regulation withholds.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Unfair procedure.</strong> Rule 21 gives ten days to show cause. It allows service by affixing a copy at the &ldquo;last known place of public resort in the village&rdquo;, which is weaker than Section 126(1)(c), which requires tender, affixing at the residence or on the land, or registered post. Rule 21(4) excuses errors in the name of the person or the description of the land. The decision is taken by the Authority in which the land vests (Section 88(a)), so it judges its own cause. There is no appeal, unlike Sections 56(2), 57(2), 58(2) and 139. After 30 days the Authority may use &ldquo;such force as may be necessary&rdquo;, with no protection for women, children or the elderly, no bar during the monsoon when sea travel stops, no inventory of belongings, and no rehabilitation.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Contrary to the Regulation's own guarantees.</strong> Relocation is &ldquo;without prejudice to the right to property&rdquo; (Section 2(31)), as are the laying out of land and removal of buildings in a scheme (Section 60(4)(a) and (d)). A dispossessed owner is to be allotted a final plot (Section 65(2)(d)) and compensated for injurious affection (Section 105). Rule 21 does not require either to happen before eviction.</li>
    <li style="margin-bottom: 6pt; text-align: justify;"><strong>Contrary to the Constitution and to Parliament's protective laws.</strong> Eviction must follow a procedure that is fair, just and reasonable (<em>Olga Tellis v. Bombay Municipal Corporation</em>, (1985) 3 SCC 545; <em>Maneka Gandhi v. Union of India</em>, (1978) 1 SCC 248). Deprivation of property must comply with Article 300A (<em>K.T. Plantation v. State of Karnataka</em>, (2011) 9 SCC 1). The Supreme Court has held that Article 300A carries procedural rights to notice, a hearing, a reasoned decision, acquisition only for a public purpose, restitution or fair compensation, an efficient and expeditious procedure, and conclusion of the proceedings (<em>Kolkata Municipal Corporation v. Bimal Kumar Shah</em>, 2024). Wrongful dispossession of a Scheduled Tribe member from land without consent is an offence under Section 3(1)(f) and (g) of the Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989. Section 41 of the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 provides special safeguards for Scheduled Tribe families. The Pandaram judgment forbids eviction of the occupants it protects.</li>
  </ul>
  <p style="margin: 0 0 8pt 0; text-align: justify;"><em>Amendment sought:</em> confine Rule 21 to the case in Section 90. Before any eviction: (i) the final plot to be allotted and possession to be offered, or compensation paid; (ii) 60 days' notice to be served personally in Malayalam or Mahl, with a copy to the Gram Panchayat; (iii) the case is heard by an officer independent of the Authority, such as the Board of Appeal under Section 76; (iv) an appeal lies, with a stay; (v) no eviction takes place during the monsoon; (vi) disputed ownership is referred under Section 66 and no eviction is made while it is pending; and (vii) no person protected by the Pandaram judgment shall be evicted.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">27. <strong>Rule 22 &ndash; draft variations.</strong> Publication only in the Gazette and local newspapers does not reach islanders.<br>
  <em>Amendment sought:</em> publication in Malayalam or Mahl, by the means in Section 127, with individual notice to each affected owner.</p>

  <p style="margin: 16pt 0 6pt 0; font-weight: bold; font-size: 12pt; text-align: left; page-break-after: avoid;">III. Finance, penalties, and the protective rules left out (Rules 26 to 31)</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">28. <strong>Rules 27 to 30 &ndash; accounts kept from the public.</strong> Section 121 requires the budget to go &ldquo;through the Chief Town Planner (Administration)&rdquo;; Rule 27 sends it directly to the Government. Section 122(1) requires an annual statement of accounts including a balance sheet; Rule 28 asks only for a &ldquo;summary&rdquo; of the Fund account. Nothing provides for the audited accounts and audit report (Section 122(4)) or the annual reports (Section 123; Section 153(2)(lxxi) and (lxxii)) to be made public. Rule 29 applies superseded pension rules. Rule 30 offers certified copies only of &ldquo;any order&rdquo;, while Section 130(2) concerns copies of plans and schemes.<br>
  <em>Amendment sought:</em> route the budget as Section 121 requires; prescribe Section 122 statement and the Section 123 report forms; publish audited accounts, audit reports and annual reports on the website; extend Rule 30 to plans and schemes; and give affected owners one free copy of every entry, plan and order concerning their land.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">29. <strong>Rule 31 &ndash; a vague penalty.</strong> Rule 31 penalises &ldquo;any contravention made by any person on any of the Rules above&rdquo;, with a daily penalty &ldquo;after conviction&rdquo;. Section 153(3) allows a penalty for a contravention of a rule, but a penalty clause must say what conduct it punishes. As drafted, an islander could be penalised for an incomplete Form B. &ldquo;Conviction&rdquo; is foreign to the Regulation, whose penalties are adjudicated under Section 138 with notice, a written representation and a hearing, and are appealable under Section 139.<br>
  <em>Amendment sought:</em> list the specific obligations whose breach is punishable; replace &ldquo;after conviction&rdquo; with the words of Section 153(3); and provide that penalties are imposed only by the adjudicating officer under Section 138.</p>

  <p style="margin: 0 0 8pt 0; text-align: justify;">30. <strong>The protective rules the Regulation requires but the draft Rules omit.</strong> The draft Rules prescribe in detail how to charge (Rule 24), penalise (Rule 31) and evict (Rule 21). They leave out almost every procedure the Regulation requires to be prescribed for the protection of the people affected. Where a section says &ldquo;within such period, and in such manner, as may be prescribed&rdquo; and nothing is prescribed, an aggrieved person has no defined window, while Section 142 makes the Authority's orders &ldquo;conclusive and enforceable&rdquo;. Selective rule-making of this kind is arbitrary under Article 14.</p>

  <table class="content-table" style="width: 100%; border-collapse: collapse; margin: 14pt 0; font-size: 10pt; line-height: 1.25; page-break-inside: auto;">
    <thead>
      <tr style="background-color: #fff; page-break-inside: avoid;">
        <th style="width: 20%; border: 1px solid #000; padding: 5pt 6pt; font-weight: bold; text-align: left;">Sections</th>
        <th style="width: 44%; border: 1px solid #000; padding: 5pt 6pt; font-weight: bold; text-align: left;">Protection it provides</th>
        <th style="width: 18%; border: 1px solid #000; padding: 5pt 6pt; font-weight: bold; text-align: left;">Clause of S.153(2)</th>
        <th style="width: 18%; border: 1px solid #000; padding: 5pt 6pt; font-weight: bold; text-align: left;">Draft Rules</th>
      </tr>
    </thead>
    <tbody>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">46, proviso</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Continuance of existing use for up to ten years</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xxi)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">48(2)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Documents Government departments must furnish</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xxiii)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">48(7)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Communication of reasons for refusal or conditions</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xxiv)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">52(4)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Time to refuse an offer of compensation</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xxviii)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">53(1), (3) and (4)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Layout particulars, communication of orders, inquiry before demolition</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xxix) to (xxxi)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">54(2) and (4)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Compensation when a permission is revoked</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xxxii) and (xxxiii)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">56(2) and (6)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Time to seek retention or appeal against a demolition notice</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xxxv) and (xxxvi)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">58(2), (4) and (5)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Appeal, compensation and acquisition notice when lawful use is stopped</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xxxvii) to (xxxix)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">70(4)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Inquiry before demolition in a scheme area</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xlvii)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">73(1)(a) and (3)(j)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Notice to persons affected by a scheme; claims for injurious affection</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(l) and (li)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">105</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Time to claim compensation for injurious affection</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(lxi)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">43 to 45</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Owner's consent and certificate for transferable development rights and accommodation reservation</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(xvii) to (xx)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">26(1)(h) and (i)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Community participation in local languages; carrying capacity studies</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">(ix)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Not prescribed</td>
      </tr>
    </tbody>
  </table>

  <p style="margin: 0 0 10pt 0; text-align: justify;"><em>Amendment sought:</em> frame these rules, publish them for consultation together with the present draft Rules, and notify none until all are ready. The rules under Sections 43 to 45 should require the owner's free, prior and written consent, given after an explanation in Malayalam or Mahl, with the right to choose monetary compensation under the 2013 Act instead.</p>

  <p style="margin: 12pt 0 4pt 0; text-align: left; font-weight: bold; page-break-after: avoid;">To Conclude the Draft Rule Offended the Provision of the Regulations and is tabulated for easy reference .</p>
  <p style="margin: 0 0 8pt 0; text-align: left; font-weight: bold; page-break-after: avoid;">Annexure &ndash; Rule-by-rule table</p>

  <table class="content-table" style="width: 100%; border-collapse: collapse; margin: 14pt 0; font-size: 10pt; line-height: 1.25; page-break-inside: auto;">
    <thead>
      <tr style="background-color: #fff; page-break-inside: avoid;">
        <th style="width: 18%; border: 1px solid #000; padding: 5pt 6pt; font-weight: bold; text-align: left;">Draft rule</th>
        <th style="width: 22%; border: 1px solid #000; padding: 5pt 6pt; font-weight: bold; text-align: left;">Provision offended</th>
        <th style="width: 32%; border: 1px solid #000; padding: 5pt 6pt; font-weight: bold; text-align: left;">Defect</th>
        <th style="width: 28%; border: 1px solid #000; padding: 5pt 6pt; font-weight: bold; text-align: left;">Amendment sought</th>
      </tr>
    </thead>
    <tbody>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 3(i)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 24(3)(d), 25(1), 25(3); s. 153(2)(viii)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Termination at will; covers Town Planning Officer and ex officio member</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Delete bracketed words; exclude those members</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 3(ii)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 24(3)(d)(i), 25(3); cf. s. 71(2)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Administrator removes Gram Panchayat nominees</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Removal only by the nominating Panchayat</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 3(iv), proviso</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 24(2), 60(4)(k)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Shareholder loophole</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Delete; wider disclosure</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 4</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 24(3)(a), 25(1)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Chairperson dependent on Administrator</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Qualifications; fixed term</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 5</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 24(3)(e), 25(3)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Every vacancy filled by Government</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Follow s. 25(3)</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 6</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 26(1)(h), 143(2); s. 153(2)(x)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Chairperson fixes meetings; no-quorum decisions; English minutes</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Fixed schedule; Panchayat nominee present; local language</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 7</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Art. 14</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">No criteria or conflict rules for outside associates</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Resolution with reasons; disclosure; cooling-off</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 8</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">S. 28; s. 153(2)(xi), (xii)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Staffing left to Administrator; no reservation</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Prescribe pattern and reservation</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 10(v)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 52, 54, 58, 105; Art. 300A</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Any payment may be withheld</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Exclude compensation; written reasons</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 11, Form A</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 11(2), 29, 30(6), 33(1)(a)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Mainland categories; no ownership or tenure</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Island classification; tenure columns; individual notice</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 12</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 26(1)(i), 32, 33(1)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">&ldquo;As may be appropriate&rdquo; dilutes s. 33</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Mandatory annexures</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rules 13 to 15</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 35 to 37, 46</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Up to 540 days while owners are frozen; Rule 14 misreads s. 36(5)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Shorter periods; existing-use decisions meanwhile</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 16, Form B</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">S. 48; s. 153(2)(xxii), (xxiii); Architects Act, 1972</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Authority registers architects; burden on every house; nothing for Government</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Simple form for homes; deemed permission</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rules 17, 25</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 49(3), 118</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Fee without waiver; no hearing rules</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Waiver; hearing on the island</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 19</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 51(5), 52(1), 52(4)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">90-day bar defeats s. 52(1)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Later of two dates</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 20</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">S. 115(4), (5)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Exempts only Government land</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Exempt islanders' homes and repairs</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 24</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">S. 115(1), (3); s. 153(2)(lxiii)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Fixes rates reserved to each Authority; presumption against owner; table errors</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Maximum and minimum only; delete presumption</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 21</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 2(31), 60(4), 65(2)(d), 90, 126; s. 153(2)(lvi); Arts. 21, 300A</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Eviction from any land on opinion; ten days; force; no appeal</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Confine to s. 90; seven safeguards</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 22</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 92(2), 127</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Gazette and newspapers only</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Local language; individual notice</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rules 27 to 30</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 121 to 123, 130(2)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Accounts not public; superseded pension rules</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Publish; update</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Rule 31</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Ss. 138, 139; s. 153(3)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Vague; &ldquo;after conviction&rdquo;</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Specify obligations; adjudication under s. 138</td>
      </tr>
      <tr style="page-break-inside: avoid;">
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Omitted rules</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">S. 153(2)(ix), (xvii) to (xxi), (xxiii), (xxiv), (xxviii) to (xxxix), (xlvii), (l), (li), (lxi)</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Protective procedures not prescribed</td>
        <td style="border: 1px solid #000; padding: 5pt 6pt; vertical-align: top; text-align: left;">Frame and publish with the draft Rules</td>
      </tr>
    </tbody>
  </table>

  <p style="margin: 16pt 0 6pt 0; font-weight: bold; font-size: 12pt; text-align: left; page-break-after: avoid;">Effect on the islanders</p>
  <p style="margin: 0 0 8pt 0; text-align: justify;">31. Taken together, the draft Rules produce the following result. The Authorities are controlled by the Administration, and the Gram Panchayat nominees can be removed or replaced at its will. Land is recorded in mainland categories that ignore ownership and custom, and the record becomes conclusive once published. Every house, repair and re-roof attracts plans, fees and charges from which only Government land is exempt. Eviction can follow on an Authority's opinion after ten days' notice. On islands of about 32 sq. km, where almost every family holds a small coconut plot and depends on the shore and lagoon, these provisions put homes, livelihoods and the rights declared by the Pandaram judgment at risk.</p>

  <p style="margin: 0 0 8pt 0; text-align: left;">The undersigned therefore requests that the Administration to:</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(a) keep the draft Rules in abeyance until the steps below are completed;</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(b) republish the draft Rules with Malayalam and Mahl translations, an explanatory note in simple language and an impact assessment, as the Pre-Legislative Consultation Policy, 2014 requires; allow at least 60 days from the publication of the translations; and accept objections by post or by hand at the offices of the Deputy Collectors, Block Development Officers and Gram Panchayats, in any language (Article 350);</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(c) consult the District Panchayat and all ten Village (Dweep) Panchayats through island-wise public hearings, and consult the National Commission for Scheduled Tribes under Article 338A(9);</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(d) amend the draft Rules as suggested ,</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(e) frame and publish the protective rules listed above together with the present draft Rules;</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(f) insert a saving clause protecting occupants covered by the Pandaram judgment and the customary land rights of the Scheduled Tribes of Lakshadweep;</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(g) complete a carrying capacity study and a social impact assessment by an institution of national repute before any land use map or Master Plan is prepared;</p>
  <p style="margin: 0 0 6pt 0; text-align: justify;">(h) publish a summary of the objections received, with reasons for accepting or rejecting each; and</p>
  <p style="margin: 0 0 16pt 0; text-align: justify;">(i) give the undersigned an opportunity of being heard before the draft Rules are finalised.</p>

  <div style="margin-top: 18pt; page-break-inside: avoid;">
    <table style="width: 100%; border: none; border-collapse: collapse; margin: 0 0 14pt 0;">
      <tr style="border: none;">
        <td style="width: 50%; border: none; vertical-align: bottom; padding: 0; text-align: left;">
          <p style="margin: 0 0 4pt 0; font-size: 12pt;">Place: {{PLACE}}</p>
          <p style="margin: 0; font-size: 12pt;">Date: {{DATE}}</p>
        </td>
        <td style="width: 50%; border: none; vertical-align: top; text-align: right; padding: 0;">
          <div style="display: inline-block; text-align: left; min-width: 180px;">
            <p style="margin: 0 0 4pt 0; font-size: 12pt;">Yours faithfully,</p>
            <div style="height: 55px; margin: 4pt 0; display: flex; align-items: center; justify-content: flex-start;">
              {{SIGNATURE}}
            </div>
            <p style="margin: 4pt 0 0 0; font-weight: bold; font-size: 12pt;">({{FULL_NAME}})</p>
          </div>
        </td>
      </tr>
    </table>

    <div style="margin-top: 14pt; text-align: left;">
      <p style="font-weight: bold; margin: 0 0 4pt 0; font-size: 12pt;">Copy to:</p>
      <p style="margin: 0 0 2pt 0; font-size: 12pt;">1. The Administrator, Union Territory of Lakshadweep, Kavaratti</p>
      <p style="margin: 0 0 2pt 0; font-size: 12pt;">2. The Chairperson, District Panchayat, Lakshadweep, Kavaratti</p>
      <p style="margin: 0 0 2pt 0; font-size: 12pt;">3. The Chairperson, National Commission for Scheduled Tribes, New Delhi (for consultation under Article 338A(9))</p>
      <p style="margin: 0 0 2pt 0; font-size: 12pt;">4. The Secretary, Ministry of Home Affairs (Union Territories Division), New Delhi</p>
    </div>
  </div>
</div>
""")

full_ts = """export const OBJECTION_3_TEMPLATE: LetterTemplateDefinition = {
  letterNumber: 3,
  title: "Draft Lakshadweep Town and Country Planning and Development (Planning and Development Authority) Rules, 2026",
  version: "1.0",
  subject: "Objections and suggestions under Section 153(7) of the Lakshadweep Town and Country Planning and Development Regulation, 2026 (Regulation No. 8 of 2026) to the draft Lakshadweep Town and Country Planning and Development (Planning and Development Authority) Rules, 2026 – F.No.16/1/2022-UD(Vol.1)(3) –objection – reg.",
  reference: "Public Notice for Pre-Legislative Consultation, F. No.16/1/2022-UD(Vol.1)(3) dated 18.09.2026, issued by the Director (Urban Development), inviting objections within 30 days.",
  copyTo: [
    "The Administrator, Union Territory of Lakshadweep, Kavaratti",
    "The Chairperson, District Panchayat, Lakshadweep, Kavaratti",
    "The Chairperson, National Commission for Scheduled Tribes, New Delhi (for consultation under Article 338A(9))",
    "The Secretary, Ministry of Home Affairs (Union Territories Division), New Delhi"
  ],
  contentHtml: `""" + html_parts[0] + """`
};
"""

with open(r'C:\Users\HP\Downloads\Town and Country Planning\backend\src\templates\objection3Template.ts', 'w', encoding='utf-8') as f:
    f.write('import { LetterTemplateDefinition } from "./defaultTemplates";\n\n' + full_ts)

print("objection3Template.ts generated successfully!")
