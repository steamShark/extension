export default function Footer() {
    return (
        <footer className="w-full bg-background/30 px-4 py-4 text-left text-sm text-white/80">
            <div className="max-w-6xl mx-auto flex items-center gap-6 justify-between">
                <span>steamShark 2025. All rights reserved.</span>
                <a
                    className="underline underline-offset-4"
                    href="https://github.com/steamShark/extension"
                    target="_blank"
                    rel="noreferrer"
                >
                    Github
                </a>
            </div>
        </footer>
    )
}