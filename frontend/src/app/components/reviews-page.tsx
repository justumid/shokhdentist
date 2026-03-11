import React, { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { Star } from "@phosphor-icons/react/dist/csr/Star";
import { PencilSimpleLine } from "@phosphor-icons/react/dist/csr/PencilSimpleLine";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { FunnelSimple } from "@phosphor-icons/react/dist/csr/FunnelSimple";
import { SortAscending } from "@phosphor-icons/react/dist/csr/SortAscending";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import {
  Review,
  REVIEW_TAGS,
  loadReviews,
  saveReview,
} from "./review-data";

interface ReviewsPageProps {
  onBack: () => void;
}

export function ReviewsPage({ onBack }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadReviews(),
  );
  const [showForm, setShowForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [hoverStar, setHoverStar] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(
    null,
  );
  const [filterRating, setFilterRating] = useState<
    number | null
  >(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0";

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));
  const maxCount = Math.max(
    ...ratingCounts.map((r) => r.count),
    1,
  );

  const allTags = Array.from(
    new Set(reviews.flatMap((r) => r.tags)),
  );

  const filteredReviews = (() => {
    let result = [...reviews];
    if (filterTag)
      result = result.filter((r) => r.tags.includes(filterTag));
    if (filterRating !== null)
      result = result.filter((r) => r.rating === filterRating);
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case "oldest":
        result.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "highest":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        result.sort((a, b) => a.rating - b.rating);
        break;
    }
    return result;
  })();

  const activeFilterCount =
    (filterTag ? 1 : 0) +
    (filterRating !== null ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const sortLabels: Record<string, string> = {
    newest: "Eng yangi",
    oldest: "Eng eski",
    highest: "Yuqori baho",
    lowest: "Past baho",
  };

  const toggleReviewTag = (tag: string) => {
    setReviewTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  };

  const submitReview = () => {
    if (!reviewText.trim()) return;
    const newReview: Review = {
      id: `user-${Date.now()}`,
      name: isAnonymous ? "Anonim" : "Bemor",
      rating: reviewRating,
      tags: reviewTags,
      text: reviewText.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    saveReview(newReview);
    setReviews(loadReviews());
    setReviewRating(5);
    setReviewTags([]);
    setReviewText("");
    setShowForm(false);
    setIsAnonymous(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "#F5F9FC",
        zIndex: 900,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        color: "#0E2A4A",
        animation: "slideInRight 0.28s ease",
      }}
    >
      <style>{`@keyframes slideInRight{from{transform:translateX(30px);opacity:0;}to{transform:translateX(0);opacity:1;}}`}</style>

      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: "#C8D8E8",
          background: "#F5F9FC",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 34,
            height: 34,
            background: "#E0F5F3",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "none",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>
          Bemorlar fikrlari
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            background: "#1FA89A",
            color: "white",
            border: "none",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <PencilSimpleLine size={14} weight="bold" />
          Yozish
        </button>
      </div>

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Rating summary card */}
        <div style={{ padding: "20px 20px 0" }}>
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "20px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#E2ECF3",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
              }}
            >
              {/* Left: big rating */}
              <div
                style={{ textAlign: "center", minWidth: 80 }}
              >
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 40,
                    fontWeight: 700,
                    color: "#0E2A4A",
                    lineHeight: 1,
                  }}
                >
                  {avgRating}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 3,
                    justifyContent: "center",
                    marginTop: 6,
                    marginBottom: 4,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      weight="fill"
                      color={
                        s <= Math.round(Number(avgRating))
                          ? "#F5A623"
                          : "#D5DFE9"
                      }
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6B8099",
                  }}
                >
                  {reviews.length} ta fikr
                </div>
              </div>

              {/* Right: rating bars */}
              <div style={{ flex: 1 }}>
                {ratingCounts.map((rc) => (
                  <div
                    key={rc.rating}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 76,
                      }}
                    >
                      {Array.from(
                        { length: rc.rating },
                        (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            weight="fill"
                            color="#F5A623"
                          />
                        ),
                      )}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        background: "#EEF3F8",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(rc.count / maxCount) * 100}%`,
                          minWidth: rc.count > 0 ? 6 : 0,
                          background:
                            rc.rating >= 4
                              ? "linear-gradient(90deg, #1FA89A, #25C4B4)"
                              : rc.rating === 3
                                ? "linear-gradient(90deg, #F5A623, #FFC857)"
                                : "linear-gradient(90deg, #E57373, #EF9A9A)",
                          borderRadius: 4,
                          transition:
                            "width 0.4s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                          rc.count > 0 ? "#5A7A96" : "#C8D8E8",
                        width: 20,
                        textAlign: "right",
                      }}
                    >
                      {rc.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Sort row */}
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            {/* Left: Tag filter dropdown (wider) */}
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <button
                onClick={() => {
                  setShowTagMenu(!showTagMenu);
                  setShowSortMenu(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  gap: 6,
                  padding: "8px 14px",
                  background: filterTag ? "#E0F5F3" : "white",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: filterTag
                    ? "#1FA89A"
                    : "#E2ECF3",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: filterTag ? "#1FA89A" : "#5A7A96",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <FunnelSimple size={15} weight="bold" style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {filterTag || "Barchasi"}
                  </span>
                </div>
                <CaretDown
                  size={12}
                  weight="bold"
                  style={{
                    transform: showTagMenu
                      ? "rotate(180deg)"
                      : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
              {showTagMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 6px 24px rgba(14,42,74,0.14)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "#E2ECF3",
                    zIndex: 50,
                    minWidth: 200,
                    overflow: "hidden",
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  <button
                    onClick={() => {
                      setFilterTag(null);
                      setShowTagMenu(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      width: "100%",
                      padding: "10px 14px",
                      background: !filterTag
                        ? "#F0FAF9"
                        : "white",
                      border: "none",
                      fontSize: 13,
                      fontWeight: !filterTag ? 600 : 400,
                      color: !filterTag ? "#1FA89A" : "#5A7A96",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      textAlign: "left",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {!filterTag && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#1FA89A",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      Barchasi
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#9BB0C4",
                        fontWeight: 500,
                      }}
                    >
                      {reviews.length}
                    </span>
                  </button>
                  {allTags.map((tag) => {
                    const isActive = filterTag === tag;
                    const tagCount = reviews.filter((r) =>
                      r.tags.includes(tag),
                    ).length;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          setFilterTag(isActive ? null : tag);
                          setShowTagMenu(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          width: "100%",
                          padding: "10px 14px",
                          background: isActive
                            ? "#F0FAF9"
                            : "white",
                          border: "none",
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          color: isActive
                            ? "#1FA89A"
                            : "#5A7A96",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          textAlign: "left",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {isActive && (
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#1FA89A",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {tag}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#9BB0C4",
                            fontWeight: 500,
                          }}
                        >
                          {tagCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Sort dropdown */}
            <div
              style={{ position: "relative", flexShrink: 0 }}
            >
              <button
                onClick={() => {
                  setShowSortMenu(!showSortMenu);
                  setShowTagMenu(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background:
                    sortBy !== "newest" ? "#E0F5F3" : "white",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor:
                    sortBy !== "newest" ? "#1FA89A" : "#E2ECF3",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color:
                    sortBy !== "newest" ? "#1FA89A" : "#5A7A96",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s ease",
                }}
              >
                <SortAscending size={15} weight="bold" />
                {sortLabels[sortBy]}
                <CaretDown
                  size={12}
                  weight="bold"
                  style={{
                    transform: showSortMenu
                      ? "rotate(180deg)"
                      : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
              {showSortMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 6px 24px rgba(14,42,74,0.14)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "#E2ECF3",
                    zIndex: 50,
                    minWidth: 155,
                    overflow: "hidden",
                  }}
                >
                  {(
                    [
                      "newest",
                      "oldest",
                      "highest",
                      "lowest",
                    ] as const
                  ).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortMenu(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "10px 14px",
                        background:
                          sortBy === option
                            ? "#F0FAF9"
                            : "white",
                        border: "none",
                        fontSize: 13,
                        fontWeight:
                          sortBy === option ? 600 : 400,
                        color:
                          sortBy === option
                            ? "#1FA89A"
                            : "#5A7A96",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {sortBy === option && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#1FA89A",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {sortLabels[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results count below */}
          <div style={{ marginTop: 10, paddingLeft: 2 }}>
            <span style={{ fontSize: 12, color: "#9BB0C4" }}>
              {filteredReviews.length} ta natija
            </span>
          </div>
        </div>

        {/* Review list */}
        <div
          style={{
            padding: "0 20px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {filteredReviews.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: "#9BB0C4",
                fontSize: 14,
              }}
            >
              Hozircha fikrlar yo'q
            </div>
          )}
          {filteredReviews.map((review, idx) => (
            <div
              key={review.id}
              style={{
                background: "white",
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: "#E2ECF3",
                borderRadius: 16,
                padding: "16px",
              }}
            >
              {/* Header: name + stars + date */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background:
                        idx % 3 === 0
                          ? "linear-gradient(135deg, #1FA89A, #25C4B4)"
                          : idx % 3 === 1
                            ? "linear-gradient(135deg, #1976D2, #42A5F5)"
                            : "linear-gradient(135deg, #7B61FF, #A78BFA)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0E2A4A",
                      }}
                    >
                      {review.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        marginTop: 2,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          weight="fill"
                          color={
                            s <= review.rating
                              ? "#F5A623"
                              : "#D5DFE9"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span
                  style={{ fontSize: 11, color: "#9BB0C4" }}
                >
                  {review.date}
                </span>
              </div>

              {/* Tags */}
              {review.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "#1FA89A",
                        background: "#E0F5F3",
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Text */}
              <div
                style={{
                  fontSize: 13,
                  color: "#5A7A96",
                  lineHeight: 1.65,
                }}
              >
                {review.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review form bottom sheet */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(14,42,74,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "20px 20px 0 0",
              width: "100%",
              maxWidth: 480,
              maxHeight: "92vh",
              overflowY: "auto",
              padding: "24px 20px 32px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#0E2A4A",
                }}
              >
                Fikr qoldirish
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "#F5F9FC",
                  border: "none",
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} weight="bold" color="#6B8099" />
              </button>
            </div>

            {/* Star rating */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B8099",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Baholash
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setReviewRating(s)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  >
                    <Star
                      size={28}
                      weight="fill"
                      color={
                        s <= (hoverStar || reviewRating)
                          ? "#F5A623"
                          : "#D5DFE9"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B8099",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Teglar (ixtiyoriy)
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {REVIEW_TAGS.map((tag) => {
                  const isSelected = reviewTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleReviewTag(tag)}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: isSelected ? "white" : "#5A7A96",
                        background: isSelected
                          ? "#1FA89A"
                          : "#F5F9FC",
                        borderWidth: 1.5,
                        borderStyle: "solid",
                        borderColor: isSelected
                          ? "#1FA89A"
                          : "#C8D8E8",
                        borderRadius: 20,
                        padding: "6px 14px",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B8099",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Fikringiz
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tajribangiz haqida yozing..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#0E2A4A",
                  background: "#F5F9FC",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Anonymous toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                padding: "12px 14px",
                background: isAnonymous ? "#E0F5F3" : "#F5F9FC",
                borderRadius: 12,
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: isAnonymous
                  ? "#1FA89A"
                  : "#C8D8E8",
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isAnonymous ? "#1FA89A" : "#5A7A96",
                  transition: "color 0.2s ease",
                }}
              >
                Anonim fikr qoldirish
              </span>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                  position: "relative",
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: isAnonymous
                    ? "#1FA89A"
                    : "#C8D8E8",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: isAnonymous ? 22 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    transition: "left 0.2s ease",
                  }}
                />
              </button>
            </div>

            {/* Submit */}
            <button
              onClick={submitReview}
              disabled={!reviewText.trim()}
              style={{
                width: "100%",
                padding: "14px",
                background: !reviewText.trim()
                  ? "#C8D8E8"
                  : "#1FA89A",
                color: "white",
                border: "none",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 600,
                cursor: !reviewText.trim()
                  ? "not-allowed"
                  : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.2s ease",
              }}
            >
              Yuborish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}