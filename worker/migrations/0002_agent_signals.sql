-- Signals that tell hosted browsers and agents apart (still no IP addresses).
ALTER TABLE hits ADD COLUMN asn INTEGER;
ALTER TABLE hits ADD COLUMN as_org TEXT;
ALTER TABLE hits ADD COLUMN accept_language TEXT;
ALTER TABLE hits ADD COLUMN sec_ch_ua TEXT;
ALTER TABLE hits ADD COLUMN sec_ch_ua_platform TEXT;
ALTER TABLE hits ADD COLUMN sec_ch_ua_mobile TEXT;
ALTER TABLE hits ADD COLUMN signature_agent TEXT;
ALTER TABLE hits ADD COLUMN signature_input TEXT;
ALTER TABLE hits ADD COLUMN signed INTEGER;

-- Browser values from the /t/ echo page (scripts/agent-hint.js), as JSON.
ALTER TABLE beacons ADD COLUMN agent_hint TEXT;
ALTER TABLE beacons ADD COLUMN client TEXT;
