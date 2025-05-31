export const ndaDocumentContent = `YoBot® Mutual Non-Disclosure Agreement (NDA)

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of the date of signature by and between YoBot, Inc., a corporation organized under the laws of [Your State], with its principal place of business at [Your Business Address] ("YoBot"), and the receiving party ("Recipient").

1. Purpose
The parties wish to explore a potential business relationship or partnership involving proprietary information, automation technologies, AI solutions, pricing strategies, source code, scripts, data models, or workflows owned or developed by either party. In connection with this, both parties may disclose certain confidential and proprietary information.

2. Confidential Information
"Confidential Information" means all non-public, proprietary, or confidential information, whether oral, written, digital, or visual, disclosed by either party that is designated as confidential or that reasonably should be understood to be confidential.

3. Obligations
The Recipient shall:
- Use the Confidential Information only for the purpose of evaluating or conducting the business relationship;
- Not disclose such information to any third party without prior written consent;
- Protect such information with the same degree of care as it uses to protect its own confidential information.

4. Exclusions
Confidential Information does not include information that:
- Was known to the Recipient before disclosure;
- Becomes public through no fault of the Recipient;
- Is received from a third party lawfully;
- Is independently developed without use of or reference to the disclosed information.

5. Term and Termination
This Agreement shall remain in effect for two (2) years from the date of execution. Either party may terminate this Agreement with written notice, but confidentiality obligations survive for the duration specified above.

6. No License
Nothing in this Agreement grants the Recipient any rights to patents, copyrights, trade secrets, or other intellectual property of the Disclosing Party.

7. Governing Law
This Agreement shall be governed by the laws of the State of [Your State], without regard to conflicts of law principles.

8. Entire Agreement
This Agreement represents the entire understanding between the parties and supersedes all prior discussions or agreements.

IN WITNESS WHEREOF, the parties have executed this Mutual NDA as of the date below.

YoBot, Inc.
Authorized Signature: ______________________
Name & Title: Tyson Lerfald, CEO

Authorized Signature: ______________________
Name & Title: Daniel Sharpe, CTO
Date: ______________________

Recipient
Authorized Signature: ______________________
Name & Title: ______________________
Date: ______________________`;

export function generatePersonalizedNDA(contactName: string, companyName: string): string {
  const currentDate = new Date().toLocaleDateString();
  
  return ndaDocumentContent.replace(
    'Recipient\nAuthorized Signature: ______________________\nName & Title: ______________________',
    `Recipient\nAuthorized Signature: ______________________\nName & Title: ${contactName}, ${companyName}`
  );
}