export function RichText({ content }: { content: string }) {
  return <div className="article-body">{content.split(/\n\n+/).map((block, index) => block.startsWith("## ") ? <h2 key={index}>{block.slice(3)}</h2> : <p key={index}>{block}</p>)}</div>;
}
