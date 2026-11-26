import { ErrorScenePage } from "@skylab-kulubu/skylcn-ui";
import SkylcnScope from "./SkylcnScope";

// The site's 404 (app/not-found.tsx): the club's 404 scene with its own words, a random
// drawing on each visit. A server component, so the browser gets the 404's drawings as
// markup and no scene code. The root layout already has the main landmark, hence as="div".
// The button is a plain link (SkylcnProvider's default), so leaving is a full page load
// and skylcn-ui's stylesheet does not follow the reader: see SkylcnScope.
export default function NotFoundScene() {
  return (
    <SkylcnScope>
      <ErrorScenePage
        kind="notFound"
        href="/"
        as="div"
        className="min-h-0 flex-1 bg-transparent px-5 pt-10 pb-12"
      />
    </SkylcnScope>
  );
}
