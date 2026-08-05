"use client";

import { Layers } from "lucide-react";

const Section = ({
  id,
  title,
  children,
  className = "mb-14",
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={`scroll-mt-24 ${className}`}>
    <h2 className="text-xl font-semibold tracking-tight text-slate-950 mb-4 pb-2 border-b border-slate-200">
      {title}
    </h2>
    {children}
  </section>
);

const Sub = ({
  title,
  children,
  className = "mb-6",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <h3 className="text-[15px] font-semibold text-slate-900 mb-2">{title}</h3>
    {children}
  </div>
);

const P = ({
  children,
  className = "mb-3",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`text-[14px] text-slate-600 leading-relaxed ${className}`}>{children}</p>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="text-[12.5px] font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
    {children}
  </code>
);

const Block = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[12.5px] font-mono text-slate-700 overflow-x-auto mb-4 leading-relaxed whitespace-pre">
    {children}
  </pre>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block text-[11px] font-mono bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded mr-1.5 mb-1">
    {children}
  </span>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="border-l-2 border-slate-300 pl-4 py-1 mb-4 text-[13px] text-slate-500 italic">
    {children}
  </div>
);

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "monorepo", label: "Monorepo" },
  { id: "auth", label: "Authentication" },
  { id: "request-lifecycle", label: "Request Lifecycle" },
  { id: "websocket-protocol", label: "WebSocket Protocol" },
  { id: "realtime-sync", label: "Realtime Sync" },
  { id: "drawing-engine", label: "Drawing Engine" },
  { id: "shape-lifecycle", label: "Shape Lifecycle" },
  { id: "renderer", label: "Renderer" },
  { id: "undo-redo", label: "Undo / Redo" },
  { id: "text-tool", label: "Text Tool" },
  { id: "eraser", label: "Eraser" },
  { id: "offline-queue", label: "Offline Queue" },
  { id: "reconnect", label: "Reconnect Flow" },
  { id: "room-lifecycle", label: "Room Lifecycle" },
  { id: "backend", label: "Backend Architecture" },
  { id: "database", label: "Database Schema" },
  { id: "performance", label: "Performance" },
  { id: "decisions", label: "Engineering Decisions" },
  { id: "limitations", label: "Known Limitations" },
];

export default function DocsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-900">
      <div className="max-w-6xl mx-auto px-5 pt-10 pb-6 flex gap-10">
        <aside className="hidden lg:block w-52 shrink-0 sticky top-10 self-start">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Contents
          </p>
          <nav className="flex flex-col gap-0.5">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-[13px] text-slate-500 hover:text-slate-900 py-0.5 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mb-10">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-2">
              Engineering Documentation
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 mb-2">
              Flowboard Internals
            </h1>
            <p className="text-[14px] text-slate-500 max-w-xl leading-relaxed">
              A technical reference for the implementation. This document covers how the system
              works, why it was built that way, and where the tradeoffs are.
            </p>
          </div>

          <Section id="overview" title="Overview">
            <P>
              Three separate runtime processes: a Next.js frontend, an Express HTTP server, and a
              Node.js WebSocket server. The HTTP server handles auth, room management, and shape
              loading. The WebSocket server handles real-time shape sync, cursor positions, and
              presence. The two backend processes share no in-process state and communicate only
              through PostgreSQL.
            </P>
            <P>
              This document covers implementation decisions, data flows, and tradeoffs. For setup
              and configuration, see the README.
            </P>
          </Section>

          <Section id="monorepo" title="Monorepo Structure">
            <P>
              pnpm workspaces with Turborepo. Build artifacts are cached by content hash, so
              rebuilding <Code>ws-backend</Code> does not invalidate the <Code>web</Code> cache
              unless a shared package changes.
            </P>
            <P>
              Three packages are architecturally significant. <Code>@repo/common</Code> holds the
              Zod schemas and <Code>generateSlug</Code>, shared by both the frontend and the HTTP
              backend, so the slug format is identical on both sides. <Code>@repo/backend-common</Code>{" "}
              loads and validates <Code>JWT_SECRET</Code> at module load time, crashing both backends
              immediately if it is missing rather than failing silently at runtime.{" "}
              <Code>@repo/db</Code> exports the Prisma client singleton used by both backends.
            </P>
          </Section>

          <Section id="auth" title="Authentication">
            <Sub title="Signup and signin">
              <P>
                Passwords are hashed with <Code>bcrypt</Code> at cost factor 10. On signin, the
                server verifies the hash and issues a JWT signed with <Code>JWT_SECRET</Code>,
                expiring in 7 days. The token payload contains <Code>id</Code>, <Code>name</Code>,
                and <Code>email</Code>.
              </P>
              <P>
                The token is stored in <Code>localStorage</Code> on the client. On page load, the
                dashboard decodes it client-side (no round-trip) using a local{" "}
                <Code>getUserFromToken</Code> helper to get the display name and verify expiry. If
                the token is missing or invalid, the user is redirected to <Code>/signin</Code>.
              </P>
            </Sub>
            <Sub title="HTTP routes">
              <P>
                Protected routes go through the <Code>middleware</Code> function in{" "}
                <Code>http-backend/src/middleware.ts</Code>. It reads the{" "}
                <Code>Authorization</Code> header, accepts both <Code>Bearer {"<token>"}</Code> and
                a raw token string, verifies the JWT, and attaches <Code>req.userId</Code> before
                calling <Code>next()</Code>.
              </P>
            </Sub>
            <Sub title="WebSocket authentication">
              <P>
                The browser WebSocket API does not support custom request headers on the initial
                handshake. Two common workarounds exist: pass the token in the URL query string, or
                pass it via the <Code>Sec-WebSocket-Protocol</Code> header.
              </P>
              <P>
                Flowboard uses <Code>Sec-WebSocket-Protocol</Code>. The client opens the WebSocket
                with the token as the subprotocol value:{" "}
                <Code>new WebSocket(WS_BACKEND, token)</Code>. The server reads it from{" "}
                <Code>request.headers["sec-websocket-protocol"]</Code>, verifies it with{" "}
                <Code>jwt.verify</Code>, and closes the connection immediately if it fails. The
                server also echoes the protocol back during the handshake via{" "}
                <Code>handleProtocols</Code>, which is required to complete the upgrade.
              </P>
              <Note>
                The URL query string approach would expose the token in server access logs and
                browser history. The subprotocol header is not logged by most reverse proxies.
              </Note>
            </Sub>
            <Sub title="Rate limiting">
              <P>
                <Code>express-rate-limit</Code> is applied to two route groups. Auth routes{" "}
                (<Code>/api/v1/auth/signup</Code>, <Code>/api/v1/auth/signin</Code>) allow 10
                requests per 15 minutes per IP. All other API routes allow 100 requests per 15
                minutes per IP. Limits are returned via standard <Code>RateLimit-*</Code> headers.
              </P>
            </Sub>
          </Section>

          <Section id="request-lifecycle" title="Request Lifecycle">
            <Sub title="Opening a canvas">
              <P>
                Navigating to <Code>/canvas/[roomId]</Code> renders the <Code>RoomCanvas</Code>{" "}
                component. It reads the JWT from <Code>localStorage</Code> and opens a WebSocket
                connection, passing the token as the subprotocol. While the connection is
                establishing, a loading state is shown.
              </P>
              <P>
                On <Code>onopen</Code>, the client sends a <Code>join_room</Code> message with the
                room slug. On the first connect, this triggers <Code>setSocket(ws)</Code>, which
                causes React to mount the <Code>Canvas</Code> component and create a new{" "}
                <Code>WhiteboardEngine</Code>. The engine calls <Code>getExistingShapes</Code>
                (an HTTP GET to the shapes endpoint) and renders them.
              </P>
            </Sub>
            <Sub title="Loading existing shapes">
              <P>
                <Code>GET /api/v1/shapes/:roomSlug</Code> returns the 250 most recent shapes for
                the room, ordered by insertion time and reversed before sending so the client
                receives them oldest-first. The endpoint also auto-joins the requesting user to the
                room if they are not already a member.
              </P>
              <P>
                Each row contains a <Code>shapeData</Code> field, which is a JSON string of the
                full shape object. The client parses each row, extracts <Code>parsed.shape</Code>,
                and loads them into the engine's <Code>shapes</Code> array.
              </P>
            </Sub>
          </Section>

          <Section id="websocket-protocol" title="WebSocket Protocol">
            <P>
              All messages are JSON strings. There is no binary framing. The message type is always
              a top-level <Code>type</Code> field.
            </P>
            <Sub title="Client to server">
              <Block>{`{ type: "join_room", roomId: string }

{ type: "shape", roomId: string, message: string }

{ type: "delete_shape", roomId: string, id: string }

{ type: "cursor", roomId: string, x: number, y: number }

{ type: "leave_room", roomId: string }`}</Block>
            </Sub>
            <Sub title="Server to client">
              <Block>{`{ type: "shape", roomId: string, message: string }

{ type: "delete_shape", roomId: string, id: string }

{ type: "cursor", userId: string, x: number, y: number, roomId: string }

{ type: "cursor_leave", userId: string, roomId: string }

{ type: "error", message: string }`}</Block>
            </Sub>
            <Sub title="Heartbeat">
              <P>
                The server runs a ping/pong heartbeat on a 30-second interval. Each cycle marks
                all connected users as <Code>isAlive = false</Code>, then sends a WebSocket ping
                frame. A <Code>pong</Code> response from the client sets <Code>isAlive = true</Code>.
                Any user that does not respond before the next cycle is terminated with{" "}
                <Code>ws.terminate()</Code>, which closes the connection without the normal closing
                handshake and removes the ghost entry from the users array.
              </P>
            </Sub>
          </Section>

          <Section id="realtime-sync" title="Realtime Synchronization">
            <Sub title="Broadcast model">
              <P>
                The server keeps a flat module-level array of connected user objects. Each entry
                holds a <Code>WebSocket</Code> reference, the user ID, and the list of room slugs
                the user has joined. When a shape message arrives, the server iterates the array
                linearly, finds matching room members, and calls <Code>ws.send()</Code> on each
                open connection, skipping the sender.
              </P>
              <P>
                Room membership exists only in memory. If the process restarts, the array is empty.
                Clients re-send <Code>join_room</Code> on reconnect, which rebuilds membership.
                This also means there is no coordination between multiple server instances. A second
                process would have a separate array, and users on different instances would not see
                each other's shapes.
              </P>
            </Sub>
            <Sub title="LRU cache for room resolution">
              <P>
                Persisting a shape requires the room's numeric database ID. Rather than querying
                the database on every draw event, the server keeps a Map-based LRU cache capped at
                500 entries. The LRU is a thin <Code>Map</Code> wrapper: a get deletes and
                re-inserts the key to move it to the most-recently-used position, and a set that
                exceeds the cap evicts the first key. <Code>Map</Code> iteration order is insertion
                order in V8, so this works without a linked list.
              </P>
              <P>
                The cache is in-process and resets on restart. On the first draw in a session, the
                server hits the database once to resolve the room ID, then caches it. All subsequent
                events for that room skip the query.
              </P>
            </Sub>
            <Sub title="Deduplication on the client">
              <P>
                When a shape is created locally, it is pushed into <Code>this.shapes</Code> and
                immediately painted before the WebSocket message is sent. The server then broadcasts
                the shape to everyone in the room, including back to the sender. Without
                deduplication, the sender would paint the shape twice.
              </P>
              <P>
                The engine checks <Code>!this.shapes.some(s ={">"} s.id === incomingShape.id)</Code>{" "}
                before adding any incoming shape. The locally-added shape is already present, so the
                echo from the server is dropped. Shapes from peers pass the check and are added
                normally.
              </P>
            </Sub>
            <Sub title="Database writes and the broadcast/persist ordering">
              <P>
                The server broadcasts to peers before persisting to the database. The sequence is:
                receive message, broadcast to peers, then call <Code>client.shape.create()</Code>{" "}
                asynchronously. A <Code>.catch()</Code> on the write logs errors but does not
                retry or alert the client.
              </P>
              <P>
                If the write fails, the shape exists in every connected client's in-memory array
                but is not in the database. On a page refresh, the shape is gone.
              </P>
              <P>
                The alternative ordering (persist first, then broadcast) would block the real-time
                path on every database round-trip. For a drawing application where latency directly
                affects how the tool feels, that tradeoff is worse than the risk of a mid-flight
                server crash losing a shape.
              </P>
            </Sub>
          </Section>

          <Section id="drawing-engine" title="Drawing Engine">
            <P>
              <Code>WhiteboardEngine</Code> is a plain TypeScript class with no React or framework
              dependencies. It owns the <Code>HTMLCanvasElement</Code>, the <Code>RoughCanvas</Code>{" "}
              instance, all drawing state, and the WebSocket reference. One instance exists per
              canvas mount and lives for the duration of the session.
            </P>
            <Sub title="Why a class, not React state">
              <P>
                Canvas drawing state (shapes array, current path, seed, cursor position) changes
                many times per second during an active draw. If that state lived in React,
                every update would trigger a re-render and a VDOM diff. The engine holds state
                as plain class fields and writes to the canvas imperatively, which is the correct
                model for a high-frequency rendering loop. React is only involved at the boundaries:
                mounting the canvas element and passing the socket reference on reconnect.
              </P>
            </Sub>
            <Sub title="HiDPI canvas scaling">
              <P>
                On mount, the resize handler reads <Code>window.devicePixelRatio</Code> and sets
                the canvas's pixel buffer to <Code>innerWidth * dpr</Code> by{" "}
                <Code>innerHeight * dpr</Code>, while keeping the CSS size at viewport dimensions.
                The 2D context is then scaled by the DPR so all coordinates can be expressed in
                CSS pixels. Without this, shapes appear blurry on retina displays.
              </P>
            </Sub>
            <Sub title="Mouse event registration">
              <P>
                <Code>mousedown</Code> and <Code>mousemove</Code> are registered on the canvas
                element. <Code>mouseup</Code> is registered on <Code>window</Code>. If the user
                releases the mouse button outside the canvas boundary, the shape is still committed
                rather than left in a dangling drawing state.
              </P>
            </Sub>
            <Sub title="RAF-coalesced preview rendering">
              <P>
                During a drag, each <Code>mousemove</Code> event cancels the pending{" "}
                <Code>requestAnimationFrame</Code> callback and schedules a new one. Multiple rapid
                events in the same frame window are collapsed into a single paint. The RAF callback
                calls <Code>render()</Code> to repaint all committed shapes, then{" "}
                <Code>drawPreview()</Code> to draw the in-progress shape on top using the current
                mouse position.
              </P>
              <P>
                On <Code>mouseup</Code>, the in-progress shape is finalized via{" "}
                <Code>createShape()</Code> and passed to <Code>addShape()</Code>. The pending RAF
                is cancelled, and <Code>render()</Code> is called once more without a preview layer.
              </P>
            </Sub>
            <Sub title="Seed determinism">
              <P>
                Every shape is assigned a Rough.js seed at draw time using{" "}
                <Code>rough.newSeed()</Code>. The seed is stored in the shape and included in the
                WebSocket message. When a peer receives the shape and renders it, they use the
                same seed, producing identical jitter. Without the seed, Rough.js randomizes the
                stroke on each call, and peers would see different visual output for the same shape.
              </P>
            </Sub>
            <Sub title="Destroy">
              <P>
                <Code>destroy()</Code> removes all event listeners, cancels any pending RAF,
                clears the cursor inactivity interval, and removes any active text input element
                from the DOM. It sets <Code>this.isDestroyed = true</Code>, which guards the
                text commit callback from running after the engine is gone. The engine is destroyed
                by <Code>Canvas.tsx</Code> in the <Code>useEffect</Code> cleanup.
              </P>
            </Sub>
          </Section>

          <Section id="shape-lifecycle" title="Shape Lifecycle">
            <Sub title="Creation">
              <P>
                On <Code>mouseup</Code>, <Code>createShape()</Code> in{" "}
                <Code>shapeFactory.ts</Code> is called with the tool name, start coordinates, end
                coordinates, a Rough.js seed, and the accumulated pencil path. It returns a typed{" "}
                <Code>Shape</Code> object with a <Code>crypto.randomUUID()</Code> ID, or{" "}
                <Code>null</Code> for degenerate cases (e.g. an arrow shorter than 4px).
              </P>
              <P>
                <Code>addShape()</Code> then: pushes the shape into <Code>this.shapes</Code>, adds
                the ID to <Code>this.myShapeIds</Code>, clears <Code>this.redoStack</Code>, calls{" "}
                <Code>render()</Code>, and calls <Code>sendShape()</Code>.
              </P>
            </Sub>
            <Sub title="Shape types">
              <P>
                The <Code>Shape</Code> type is a discriminated union of seven variants:
              </P>
              <div className="flex flex-wrap gap-1 mb-3">
                {["Rect", "Circle", "Diamond", "Line", "Arrow", "Pencil", "Text"].map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <P>
                Each variant carries the minimal geometry required to reconstruct the shape:
                bounding box coordinates for Rect and Diamond, center and radius for Circle, start
                and end points for Line and Arrow, a point array for Pencil, and text plus position
                for Text. All variants include a Rough.js <Code>seed</Code> that ensures the
                hand-drawn jitter is deterministic and identical across all clients for the same
                shape.
              </P>
            </Sub>
            <Sub title="Deletion">
              <P>
                Shapes are deleted by ID. <Code>sendDeleteShape(id)</Code> sends a{" "}
                <Code>delete_shape</Code> message to the server. On the server, this broadcasts the
                deletion to peers and calls <Code>client.shape.deleteMany()</Code> filtered by{" "}
                <Code>roomId</Code> and <Code>shapeId</Code>.
              </P>
              <P>
                On the receiving client, <Code>this.shapes = this.shapes.filter(s ={">"} s.id !== message.id)</Code>{" "}
                removes the shape and <Code>render()</Code> repaints.
              </P>
            </Sub>
          </Section>

          <Section id="renderer" title="Renderer">
            <P>
              All rendering goes through two functions in <Code>renderer.ts</Code>:{" "}
              <Code>renderShapes</Code> and <Code>renderCursors</Code>. Every render clears the
              entire canvas and redraws from the shapes array. There is no dirty-rect optimization
              or retained-mode scene graph.
            </P>
            <Sub title="Rough.js">
              <P>
                Geometric shapes (Rect, Circle, Diamond, Line, Arrow, Pencil) are drawn via the
                Rough.js <Code>RoughCanvas</Code> API, which wraps the native 2D context. Rough.js
                generates slightly imperfect strokes using the provided <Code>seed</Code> value.
                The same seed always produces the same visual output, so a shape drawn on one
                client looks identical when received and rendered by another.
              </P>
            </Sub>
            <Sub title="Text rendering">
              <P>
                Text shapes bypass Rough.js and use the native <Code>ctx.fillText()</Code> with
                the Patrick Hand font at 22px. The font matches the hand-drawn aesthetic and is
                consistent with the overlay input element used during text entry.
              </P>
            </Sub>
            <Sub title="Cursor rendering">
              <P>
                Remote cursors are drawn after shapes in every render call, so they appear on top.
                Each is a small filled polygon with a white fill and a stroke color derived by
                hashing the user ID modulo a four-element palette. A 1-second interval checks all
                cursor timestamps and removes entries that have not been updated recently, which
                handles the case where a peer stops moving the mouse without disconnecting.
              </P>
              <P>
                Because cursors are composited in every <Code>render()</Code> call, any cursor
                movement from a peer triggers a full repaint of all shapes on the canvas. This is
                the primary source of render cost in a room with many shapes and active users.
              </P>
            </Sub>
          </Section>

          <Section id="undo-redo" title="Undo / Redo">
            <P>
              Undo and redo are scoped to the current user's own shapes. They have no effect on
              shapes drawn by other users.
            </P>
            <Sub title="Undo">
              <P>
                <Code>undo()</Code> walks <Code>this.shapes</Code> backwards and finds the first
                shape whose ID is in <Code>this.myShapeIds</Code>. It splices that shape out of the
                array, removes it from <Code>myShapeIds</Code>, pushes it onto{" "}
                <Code>this.redoStack</Code>, repaints, and sends a <Code>delete_shape</Code> to the
                server. The deletion is broadcast to peers so they see the shape disappear too.
              </P>
            </Sub>
            <Sub title="Redo">
              <P>
                <Code>redo()</Code> pops from <Code>this.redoStack</Code>, pushes the shape back
                into <Code>this.shapes</Code>, adds it to <Code>myShapeIds</Code>, repaints, and
                sends a <Code>shape</Code> message. Peers receive and render it.
              </P>
            </Sub>
            <Sub title="Redo stack clearing">
              <P>
                <Code>this.redoStack = []</Code> is called inside <Code>addShape()</Code>. Any time
                a new shape is drawn, the redo history is discarded. This matches the behavior of
                most editors.
              </P>
            </Sub>
            <Sub title="Keyboard shortcuts">
              <P>
                <Code>Ctrl+Z</Code> triggers <Code>undo()</Code> and <Code>Ctrl+Y</Code> triggers{" "}
                <Code>redo()</Code>. The <Code>keydown</Code> listener is registered on{" "}
                <Code>window</Code> and removed in <Code>destroy()</Code>.
              </P>
            </Sub>
          </Section>

          <Section id="text-tool" title="Text Tool">
            <P>
              The text tool does not draw on the canvas during input. Instead, it injects a native{" "}
              <Code>{"<input>"}</Code> element into <Code>document.body</Code> positioned at the
              click location using <Code>position: fixed</Code> with the mouse event's{" "}
              <Code>clientX</Code> and <Code>clientY</Code>.
            </P>
            <P>
              The input is styled to match the canvas text font (Patrick Hand, 22px, transparent
              background, no border) so it is visually indistinguishable from text on the canvas.
              Its width expands dynamically as the user types by setting <Code>width: auto</Code>{" "}
              and then reading <Code>scrollWidth</Code>.
            </P>
            <P>
              The input is committed (converted to a <Code>Text</Code> shape) on <Code>blur</Code>{" "}
              or on <Code>Enter</Code>. It is discarded (no shape created) on <Code>Escape</Code>{" "}
              or if the trimmed value is empty. The canvas position of the text is recorded at{" "}
              <Code>mousedown</Code> time (<Code>spawnX</Code>, <Code>spawnY</Code>) and stored in
              the shape, not re-derived from the input element position.
            </P>
            <Note>
              Only one text input can be active at a time. If the user clicks to create a second
              text input while one is already open, the first input is blurred, which commits it,
              before the new one opens.
            </Note>
          </Section>

          <Section id="eraser" title="Eraser">
            <P>
              The eraser uses point-in-shape hit testing, not pixel-based alpha checking. On each{" "}
              <Code>mousedown</Code> while the eraser tool is active, <Code>eraseAt(x, y)</Code>{" "}
              walks <Code>this.shapes</Code> in reverse order (topmost first) and calls{" "}
              <Code>isPointInShape(x, y, shape, tolerance)</Code> with a tolerance of 5px.
            </P>
            <P>
              If a hit is found, the shape is spliced out, <Code>render()</Code> is called, and a{" "}
              <Code>delete_shape</Code> is sent. Only one shape is erased per click. The eraser does
              not work on drag; it tests at the click point only.
            </P>
            <Sub title="Hit test geometry">
              <P>Each shape type uses a different geometric test:</P>
              <ul className="text-[14px] text-slate-600 space-y-1.5 mb-3 ml-4 list-disc">
                <li>
                  <strong>Rect, Text</strong>: axis-aligned bounding box test with tolerance padding
                  on all sides.
                </li>
                <li>
                  <strong>Circle</strong>: Euclidean distance from center less than or equal to radius.
                </li>
                <li>
                  <strong>Diamond</strong>: normalized Manhattan distance from center (
                  <Code>dx/halfW + dy/halfH {"<="} 1</Code>).
                </li>
                <li>
                  <strong>Line, Arrow</strong>: perpendicular distance from the point to the
                  line segment using the parametric projection formula. Arrow also checks a 15px
                  radius around the arrowhead tip.
                </li>
                <li>
                  <strong>Pencil</strong>: iterates all recorded points and returns true if any
                  point is within <Code>tolerance * 3</Code> (15px) of the click.
                </li>
              </ul>
              <Note>
                Text hit testing approximates character width as{" "}
                <Code>TEXT_FONT_SIZE * 0.5</Code> per character. This is a rough estimate and may
                miss narrow characters or hit wide ones inaccurately.
              </Note>
            </Sub>
          </Section>

          <Section id="offline-queue" title="Offline Queue">
            <P>
              <Code>safeSend(message)</Code> is the single entry point for all outgoing WebSocket
              messages from the engine. It checks <Code>socket.readyState === WebSocket.OPEN</Code>{" "}
              before calling <Code>socket.send()</Code>.
            </P>
            <Sub title="What gets queued">
              <P>
                When the socket is not open, <Code>safeSend</Code> parses the message type. Cursor
                messages (<Code>type === "cursor"</Code>) are dropped. They are ephemeral and have
                no value after the fact. Only <Code>shape</Code> and <Code>delete_shape</Code>{" "}
                messages enter <Code>this.offlineQueue</Code>, which is a plain string array
                drained FIFO on reconnect.
              </P>
            </Sub>
            <Sub title="Undo/redo cancellation in the queue">
              <P>
                Before pushing to the queue, <Code>safeSend</Code> checks whether the incoming
                message is the inverse of an existing entry. If a <Code>delete_shape</Code> arrives
                for a shape that has a pending <Code>shape</Code> in the queue (or vice versa),
                the existing entry is spliced out and the new message is discarded.
              </P>
              <P>
                This handles undo/redo cycles during an offline period. Drawing a shape while
                offline queues a <Code>shape</Code> message. Undoing it immediately queues a
                <Code>delete_shape</Code>. The cancellation logic removes both, leaving the queue
                as if neither event happened. Without this, reconnect would replay a
                create-then-delete pair for a shape the user already discarded.
              </P>
            </Sub>
          </Section>

          <Section id="reconnect" title="Reconnect Flow">
            <Sub title="Exponential backoff">
              <P>
                On <Code>ws.onclose</Code>, if the close code is not an auth error (1008, 4001, or
                4003), the client schedules a reconnect using{" "}
                <Code>Math.min(1000 * Math.pow(2, attempts), 30_000)</Code>. Attempts are capped at
                5. After 5 failures, the UI shows a refresh prompt.
              </P>
              <P>
                The delay sequence is: 1s, 2s, 4s, 8s, 16s, then capped at 30s. An application-level{" "}
                <Code>isReconnecting</Code> flag prevents concurrent reconnect attempts from racing
                if <Code>onclose</Code> fires more than once before the new connection opens.
              </P>
            </Sub>
            <Sub title="Online/offline events">
              <P>
                <Code>window</Code> <Code>offline</Code> and <Code>online</Code> events are
                registered alongside the WebSocket lifecycle. On the <Code>offline</Code> event, the
                current socket is closed and <Code>isConnected</Code> is set to false. On the{" "}
                <Code>online</Code> event, the attempt counter is reset to 0 and{" "}
                <Code>connect()</Code> is called immediately, bypassing the backoff timer.
              </P>
            </Sub>
            <Sub title="Engine handoff on reconnect">
              <P>
                The key design point: the <Code>Canvas</Code> component and{" "}
                <Code>WhiteboardEngine</Code> are never destroyed on reconnect. Only the WebSocket
                changes.
              </P>
              <P>
                On <Code>onopen</Code>, if <Code>engineRef.current</Code> already exists,{" "}
                <Code>engine.updateSocket(ws)</Code> is called instead of re-mounting{" "}
                <Code>Canvas</Code>. <Code>updateSocket</Code> replaces the engine's internal socket
                reference, re-registers the <Code>onmessage</Code> handler on the new socket, calls{" "}
                <Code>flushQueue()</Code> to drain any offline-queued messages, then calls{" "}
                <Code>getExistingShapes()</Code> to fetch and merge any shapes that were persisted
                by other users while this client was disconnected.
              </P>
              <Note>
                Shapes from <Code>getExistingShapes</Code> are merged by ID check:{" "}
                <Code>!this.shapes.some(existing ={">"} existing.id === s.id)</Code>. Shapes already
                in the local array are not duplicated.
              </Note>
            </Sub>
          </Section>

          <Section id="room-lifecycle" title="Room Lifecycle">
            <Sub title="Creation">
              <P>
                <Code>POST /api/v1/canvas</Code> accepts a <Code>name</Code> field, runs it through{" "}
                <Code>generateSlug()</Code>, checks for slug uniqueness, and creates the room. The
                creator is added as both the admin and a member.
              </P>
              <P>
                <Code>generateSlug</Code> lowercases the name, replaces non-alphanumeric characters
                with hyphens, collapses consecutive hyphens, and strips leading/trailing hyphens.
                "My Room #1" becomes "my-room-1".
              </P>
            </Sub>
            <Sub title="Joining">
              <P>
                Any authenticated user who hits <Code>GET /api/v1/shapes/:roomSlug</Code> is
                automatically added to the room's member list if not already a member. There is no
                explicit join step or invite code. Knowing the room slug is sufficient to join.
              </P>
            </Sub>
            <Sub title="Deletion">
              <P>
                <Code>DELETE /api/v1/canvas/:roomId</Code> checks if the requesting user is the
                room admin. If yes, the room and all its shapes are deleted (Prisma cascade). If
                no, the user is simply disconnected from the room (removed from the members list).
              </P>
            </Sub>
            <Sub title="Presence on disconnect">
              <P>
                On WebSocket <Code>close</Code>, the server sends a <Code>cursor_leave</Code>{" "}
                message to all other users in the departed user's rooms. Clients remove that user's
                cursor from the canvas on receipt. This is best-effort — if the server process
                crashes, no leave message is sent.
              </P>
            </Sub>
          </Section>

          <Section id="backend" title="Backend Architecture">
            <Sub title="HTTP backend (Express)">
              <P>
                A standard Express app with no middleware framework beyond CORS, JSON body parsing,
                and the custom JWT middleware. All routes are prefixed <Code>/api/v1</Code>. Route
                handlers are async functions; unhandled promise rejections are caught and return
                500. No global error handler.
              </P>
            </Sub>
            <Sub title="WebSocket backend (ws)">
              <P>
                A single <Code>WebSocketServer</Code> instance. The users array is module-level
                state — there is no class wrapping it. All message handling is inside a single{" "}
                <Code>ws.on("message")</Code> handler with a type-based switch. The server never
                sends acknowledgements; all operations are fire-and-forget from the server's
                perspective.
              </P>
              <P>
                Database writes (shape create, shape deleteMany) are not awaited before broadcasting.
                They are queued as background microtasks with error logging in the{" "}
                <Code>.catch()</Code> handler.
              </P>
            </Sub>
            <Sub title="Fail-fast startup">
              <P>
                <Code>@repo/backend-common</Code> throws synchronously during module load if{" "}
                <Code>JWT_SECRET</Code> is missing. Both backends import this before starting their
                servers, so a misconfigured environment produces an immediate crash with a clear
                message rather than a runtime auth failure later.
              </P>
            </Sub>
          </Section>

          <Section id="database" title="Database Schema">
            <Block>{`model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String

  rooms       Room[]
  joinedRooms Room[] @relation("RoomMembers")
  shapes      Shape[]
}

model Room {
  id        Int      @id @default(autoincrement())
  slug      String   @unique
  createdAt DateTime @default(now())
  adminId   Int
  admin     User     @relation(...)
  members   User[]   @relation("RoomMembers")
  shapes    Shape[]

  @@index([adminId])
}

model Shape {
  id        Int      @id @default(autoincrement())
  roomId    Int
  userId    Int
  shapeId   String
  shapeType String
  shapeData String
  createdAt DateTime @default(now())

  @@index([roomId])
  @@index([userId])
  @@index([roomId, shapeId])
}`}</Block>
            <P>
              <Code>shapeData</Code> stores the complete shape JSON as a string. This avoids
              normalizing each shape variant into columns and makes adding new shape types
              non-breaking at the database level.
            </P>
            <P>
              <Code>shapeId</Code> is the client-generated UUID. It is not marked{" "}
              <Code>@unique</Code> in the schema. The composite index on{" "}
              <Code>[roomId, shapeId]</Code> makes lookups efficient but does not enforce
              uniqueness at the database level. A shape replayed on reconnect would create a
              duplicate row.
            </P>
          </Section>

          <Section id="performance" title="Performance Considerations">
            <Sub title="RAF-coalesced rendering">
              <P>
                During active drawing, <Code>mousemove</Code> can fire at 60-240 events per
                second. Each event cancels the pending RAF and schedules a new one. Only the last
                mouse position in a given frame window triggers a repaint, capping redraws at the
                display refresh rate regardless of mouse speed.
              </P>
            </Sub>
            <Sub title="Pencil point filtering">
              <P>
                While drawing with the pencil tool, new points are only recorded if the distance
                from the last recorded point exceeds <Code>PENCIL_MIN_DISTANCE</Code> (5px). This
                reduces the size of the points array and the WebSocket payload for freehand strokes.
              </P>
            </Sub>
            <Sub title="Cursor throttling">
              <P>
                Cursor broadcasts are throttled to one message per <Code>CURSOR_THROTTLE_MS</Code>{" "}
                (35ms) using a <Code>performance.now()</Code> timestamp comparison. Cursor messages
                are never queued when offline; they are simply dropped.
              </P>
            </Sub>
            <Sub title="Shape load limit">
              <P>
                The shapes endpoint uses <Code>take: 250</Code>. This bounds the initial load time
                and the rendering cost on rooms with long history. The 250 most recent shapes are
                loaded; older ones are not shown on join.
              </P>
            </Sub>
            <Sub title="Full redraw on every render">
              <P>
                There is no dirty-region tracking. Every <Code>render()</Code> call clears the
                canvas and redraws all shapes. This is simple and correct, but the cost scales
                linearly with the number of shapes. On a room with 250 shapes and active cursor
                movement, the browser paints all 250 shapes on every cursor update.
              </P>
            </Sub>
          </Section>

          <Section id="decisions" title="Engineering Decisions">
            <Sub title="Native ws over Socket.io">
              <P>
                Socket.io adds a polling fallback, a custom binary framing layer, a reconnection
                protocol, and a client bundle. None of those were needed here. Using{" "}
                <Code>ws</Code> directly keeps the protocol transparent and the server dependency
                footprint small.
              </P>
            </Sub>
            <Sub title="Class-based engine, not React state">
              <P>
                <Code>WhiteboardEngine</Code> is a plain class. Canvas state (shapes, drawing
                coordinates, paths) is mutable and changes many times per second during drawing. If
                these were React state, every update would trigger a component re-render and VDOM
                diff. The class holds the canvas directly and updates it imperatively, which is the
                correct model for a high-frequency rendering loop.
              </P>
            </Sub>
            <Sub title="Canvas not remounted on reconnect">
              <P>
                On reconnect, only the socket is replaced via <Code>updateSocket()</Code>. The
                canvas element, the engine instance, the shapes array, and the offline queue all
                survive the reconnect. If the canvas were remounted, the offline queue would be
                lost and the shapes would need to be re-fetched from scratch.
              </P>
            </Sub>
            <Sub title="Discriminated union for Shape type">
              <P>
                <Code>Shape</Code> is a TypeScript discriminated union. Each variant has a{" "}
                <Code>type</Code> literal field. The renderer, hit tester, and shape factory all
                switch on <Code>shape.type</Code>. Adding a new shape type requires adding a
                variant to the union, which the TypeScript compiler then forces you to handle in
                every exhaustive switch.
              </P>
            </Sub>
            <Sub title="Zod for shared validation">
              <P>
                Input validation schemas live in <Code>@repo/common</Code> and are used by both
                the HTTP backend (for request body validation) and the frontend (for the slug
                preview). The slug generation logic is also in the same package, ensuring the slug
                produced by the frontend preview exactly matches what the backend will store.
              </P>
            </Sub>
          </Section>

          <Section id="limitations" title="Known Limitations" className="mb-0">
            <Sub title="Offline sync depends on browser connection state">
              <P>
                The queue only activates when <Code>socket.readyState !== OPEN</Code>. When a
                physical network connection drops, the browser may keep reporting{" "}
                <Code>OPEN</Code> for several seconds while the OS TCP stack retransmits. Shapes
                passed to <Code>socket.send()</Code> during that window are accepted by the browser
                API and discarded by the OS. They never enter the queue. Recovering them would
                require a server-to-client acknowledgement protocol.
              </P>
            </Sub>
            <Sub title="Single WebSocket server instance">
              <P>
                Room membership is in-process memory. A second instance would maintain a separate
                users array, and users routed to different instances would not receive each other's
                broadcasts. Horizontal scaling requires a shared message bus between instances.
              </P>
            </Sub>
            <Sub title="Offline queue replay can produce duplicate database rows">
              <P>
                <Code>shapeId</Code> has no <Code>@unique</Code> constraint. If a shape was
                already written to the database before the connection dropped, replaying the queue
                on reconnect creates a second row with the same <Code>shapeId</Code>. Client-side
                deduplication prevents visual duplication, but the extra rows accumulate.
              </P>
            </Sub>
            <Sub title="No conflict resolution">
              <P>
                Operations are applied in arrival order with no CRDTs or operational transforms.
                Concurrent deletes of the same shape produce two redundant database deletes with no
                visible issue. Concurrent adds of conflicting shapes both persist. For drawing,
                this is generally acceptable.
              </P>
            </Sub>
            <Sub title="Room access is controlled only by slug">
              <P>
                Any authenticated user who knows a room slug can join and draw. There is no
                per-room access control list.
              </P>
            </Sub>
            <Sub title="No canvas panning or zoom">
              <P>
                Coordinates are fixed to the viewport. Drawing is bounded by the screen dimensions.
              </P>
            </Sub>
            <Sub title="Mobile drawing is not supported" className="mb-0">
              <P className="mb-0">
                The engine handles <Code>mousedown</Code>, <Code>mousemove</Code>, and{" "}
                <Code>mouseup</Code> only. Touch events are not implemented.
              </P>
            </Sub>
          </Section>
        </main>
      </div>

      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-7">
          <div className="flex flex-col items-center gap-5 sm:relative sm:flex-row sm:justify-center sm:items-center sm:gap-0">
            <div className="flex items-center gap-2.5 sm:absolute sm:left-0">
              <div className="bg-black p-[6px] rounded-md shrink-0">
                <Layers className="h-3.5 w-3.5 text-white" strokeWidth={2} />
              </div>
              <div>
                <span className="font-semibold text-sm text-black tracking-tight leading-none block">
                  Flowboard
                </span>
                <span className="text-xs text-slate-400 font-mono leading-tight block mt-0.5">
                  Engineering Portfolio
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="/"
                className="text-sm text-slate-500 hover:text-black transition-colors duration-150"
              >
                Home
              </a>
              <a
                href="/dashboard"
                className="text-sm text-slate-500 hover:text-black transition-colors duration-150"
              >
                Dashboard
              </a>
              <a
                href="https://github.com/adityasrc/flowboard"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-500 hover:text-black transition-colors duration-150"
              >
                GitHub
              </a>
            </div>

            <p className="text-xs font-mono text-slate-300 sm:absolute sm:right-0">
              &copy; {currentYear} Flowboard
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}