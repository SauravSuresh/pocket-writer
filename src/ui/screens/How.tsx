import { store } from "../store";
import { Header } from "../Header";
import { go } from "../router";
export function How() {
  return <><Header title="How this works" /><main style="max-width:680px;font-size:16px;line-height:1.6">
    <h2>Gagan Achari</h2>
    <p>You wrote a draft. People read it. They said things. Some of it was smart, some of it was stupid, all of it is valid. Your job is not to argue — it's to find out what in the screenplay made them say it.</p>
    <ol>
      <li><b>Every opinion is valid.</b> Log it. Even the dumb one.</li>
      <li><b>If they misunderstood, the screenplay did it.</b> Not their empathy. Yours.</li>
      <li><b>Write the issue, not the opinion.</b> "Why is Anto so boring" is feedback. "Anto has no agency" is the issue.</li>
      <li><b>Ask what's underneath.</b> Most issues are symptoms. The tool will keep asking. Let it.</li>
      <li><b>Not everything gets fixed.</b> But you have to say how you <i>would</i> fix it, and what the film would lose. That's the exercise.</li>
      <li><b>Bosses first.</b> The order is enforced: root causes on top. Solve one and its symptoms come up for review — some will fall on their own.</li>
      <li><b>The room is watching.</b> Every giver warms up as you honour what they said. Ignore someone and they walk out.</li>
      <li><b>End the turn.</b> Export the action plan. Go write. Come back with the next draft and start empty.</li>
    </ol>
    <div class="row"><button class="pri" onClick={() => { store.update(a => { a.settings.seenHowItWorks = true; }); go("/"); }}>Got it</button></div>
  </main></>;
}
