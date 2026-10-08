import { uploadSiblingUrl } from '@/utils/uploadMedia'

type ProductVideoProps = {
  src: string
  className?: string
}

export function ProductVideo({ src, className }: ProductVideoProps) {
  return (
    <video
      className={className}
      src={src}
      poster={uploadSiblingUrl(src, 'poster') ?? undefined}
      controls
      playsInline
      preload="none"
    />
  )
}
