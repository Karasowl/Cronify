

interface Props {
  title?: string
}

export default function BodyCard({title}: Props) {
  return (
    <article className="">
        <div className="card-header">{title}
        </div>
        <div className="card-body">
        </div>
        <div className="card-buttons">
        </div>
        <p className="card-footer">creado - */*/*
        </p>
    </article>
  )
}
