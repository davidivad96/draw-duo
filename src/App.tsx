import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Room from "./pages/Room";
import NotFound from "./pages/NotFound";

const App = () => (
  <Switch>
    <Route path="/" component={Home} />
    <Route path="/:roomId">{(params) => <Room roomId={params.roomId} />}</Route>
    <Route>
      <NotFound />
    </Route>
  </Switch>
);

export default App;
