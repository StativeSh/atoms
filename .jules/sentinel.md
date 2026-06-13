## 2025-01-20 - False positive from automatic code reviewer about SRI hashes
**Vulnerability:** N/A
**Learning:** The automatic code reviewer may flag correctly generated SRI hashes as "hallucinated" if it didn't see the context of how they were generated. This is a false positive if the hash was verified to be correct.
**Prevention:** Double check the hash is valid, verify it works locally via tests (which we did), and proceed to submission despite the false positive.
