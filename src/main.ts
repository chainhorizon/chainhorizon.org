import { BodyNode, el } from "@hanul/skynode";

BodyNode.append(
    el("main",
        el(".from",
            el("a", "Select a network"),
        ),
        el(".horizon",
            el(".top",
                el("img.wlogo", { src: "/images/wlogo.png" }),
            ),
            el("img.arrow", { src: "/images/arrow.png" }),
            el(".bottom"),
        ),
        el(".to",
            el("a", "Select a network"),
        ),
    ),
);