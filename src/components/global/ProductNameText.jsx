function productNameParts(product) {
  const fullName = String(product?.name ?? '');
  const revisionLabel = String(product?.revisionLabel ?? '').trim();
  const revisionSuffix = revisionLabel ? ` (${revisionLabel})` : '';
  const explicitBaseName = String(product?.baseName ?? '').trim();
  const baseName =
    explicitBaseName ||
    (revisionSuffix && fullName.endsWith(revisionSuffix)
      ? fullName.slice(0, -revisionSuffix.length)
      : fullName);
  const showsRevision =
    Boolean(revisionLabel) &&
    (fullName !== baseName || fullName.endsWith(revisionSuffix));

  return {
    baseName,
    revisionLabel: showsRevision ? revisionLabel : '',
  };
}

export default function ProductNameText({ product }) {
  const { baseName, revisionLabel } = productNameParts(product);
  return (
    <>
      {baseName}
      {revisionLabel && (
        <span className="product-revision-label">({revisionLabel})</span>
      )}
    </>
  );
}
