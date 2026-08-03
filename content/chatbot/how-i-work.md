# How Suyu works

The through-line across his projects is a working discipline borrowed from
research: decide the rules before you can be tempted to bend them.

## Design, then implement

A written spec is the source of truth. He plans the decisions on paper
first, then writes code against them — so the hard choices are made
deliberately rather than mid-keystroke.

This is not only a personal-project habit. In his previous roles, when
requirements arrived from other departments, he would organise and design
first, then send a written plan or specification back to the team and the
requester for confirmation before building anything.

## Pre-registration

In the BaZi study he froze 47 hypotheses before inspecting a single
correlation, so there was no way to tune his way to a positive result. The
study reported 47 nulls, exactly as they landed.

## Frozen test vectors

The World Cup value maths was written once in Python and ported to
TypeScript, with golden vectors keeping the two implementations locked in
sync — 84 passing tests.

## Fail-loud pipelines

His ETL raises on an unmatched team name or a silently-shifted coordinate
rather than approximating. A loud failure beats a plausible-looking wrong
answer.

## On data quality generally

If someone asks how he approaches data quality, these four habits are the
answer. Concretely: validate at the boundary and fail there rather than
letting bad rows through; make jobs idempotent so a re-run is safe; freeze
known-good outputs as test vectors so a regression is visible rather than
silent; and separate what is measured from what is modeled, so a model is
never mistaken for a fact. The World Cup site keeps market-implied
probability as ground truth with the model as a clearly-labeled experimental
layer for exactly that reason.

## What this is for

The point of the discipline is to be able to report a negative result
without flinching. He treats epistemic honesty — saying what the data
actually showed, including nothing — as a professional skill rather than a
personality trait.
