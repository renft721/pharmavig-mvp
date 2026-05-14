"""
NLP pipeline for extracting drug safety information from text
"""

import logging
from typing import List, Dict, Any, Optional
import spacy
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class ExtractedEntity:
    """Represents an extracted entity from text"""
    text: str
    label: str
    confidence: float

@dataclass
class SafetyFinding:
    """Represents a safety-relevant finding"""
    adverse_reaction: str
    frequency: Optional[str]
    severity: Optional[str]
    affected_population: Dict[str, Any]
    conclusion: Optional[str]

class DrugNERExtractor:
    """
    Named Entity Recognition for drug safety information
    Uses spaCy + custom patterns
    """
    
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("Loaded spaCy model: en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found. Download with: python -m spacy download en_core_web_sm")
            self.nlp = None
    
    def extract_entities(self, text: str) -> List[ExtractedEntity]:
        """
        Extract named entities from text using spaCy
        
        Args:
            text: Input text to extract entities from
            
        Returns:
            List of ExtractedEntity objects
        """
        if not self.nlp:
            logger.error("spaCy model not loaded")
            return []
        
        doc = self.nlp(text)
        entities = []
        
        for ent in doc.ents:
            entities.append(ExtractedEntity(
                text=ent.text,
                label=ent.label_,
                confidence=0.95  # spaCy doesn't provide confidence scores by default
            ))
        
        return entities
    
    def extract_safety_findings(self, text: str, drug_name: str) -> List[SafetyFinding]:
        """
        Extract safety-relevant findings from article text
        
        Args:
            text: Article text
            drug_name: Name of the drug to extract findings about
            
        Returns:
            List of SafetyFinding objects
        """
        findings = []
        
        # TODO: Implement extraction logic
        # This is a complex task that requires:
        # 1. Sentence segmentation
        # 2. Relationship extraction (drug -> adverse reaction)
        # 3. Frequency/severity classification
        # 4. Population extraction
        
        # For MVP: basic keyword-based extraction
        adverse_reactions = self._extract_adverse_reactions(text)
        frequencies = self._extract_frequencies(text)
        
        for reaction in adverse_reactions:
            finding = SafetyFinding(
                adverse_reaction=reaction,
                frequency=self._match_frequency(text, reaction),
                severity=None,  # TODO: Classify severity
                affected_population={},  # TODO: Extract population info
                conclusion=self._extract_conclusion(text)
            )
            findings.append(finding)
        
        return findings
    
    def _extract_adverse_reactions(self, text: str) -> List[str]:
        """Extract mentions of adverse reactions (basic keyword matching)"""
        # These should be from a medical dictionary/ontology
        adverse_reactions_keywords = [
            "rash", "nausea", "vomiting", "dizziness", "headache",
            "fever", "fatigue", "pain", "bleeding", "bruising",
            "allergic reaction", "anaphylaxis", "liver damage",
            "kidney failure", "arrhythmia", "hypertension"
        ]
        
        found_reactions = []
        text_lower = text.lower()
        
        for keyword in adverse_reactions_keywords:
            if keyword in text_lower:
                found_reactions.append(keyword.title())
        
        return found_reactions
    
    def _extract_frequencies(self, text: str) -> List[str]:
        """Extract frequency mentions"""
        frequency_patterns = [
            "rare", "very rare", "uncommon", "common", "very common",
            "1 in 1,000", "1 in 10,000", "1%", "0.1%"
        ]
        
        found_frequencies = []
        text_lower = text.lower()
        
        for pattern in frequency_patterns:
            if pattern in text_lower:
                found_frequencies.append(pattern)
        
        return found_frequencies
    
    def _match_frequency(self, text: str, reaction: str) -> Optional[str]:
        """Find frequency associated with a reaction"""
        # Simple heuristic: find frequency mentions near the reaction
        # TODO: Use sentence-level analysis for better accuracy
        frequencies = self._extract_frequencies(text)
        return frequencies[0] if frequencies else None
    
    def _extract_conclusion(self, text: str) -> Optional[str]:
        """Extract author conclusion (last 2-3 sentences)"""
        sentences = text.split('.')
        if len(sentences) > 2:
            return '.'.join(sentences[-3:-1]).strip()
        return None

class ConflictDetector:
    """
    Detect contradictory findings across sources
    Flag for human review
    """
    
    @staticmethod
    def detect_contradictions(
        findings_by_source: Dict[str, List[SafetyFinding]]
    ) -> List[Dict[str, Any]]:
        """
        Compare findings across sources and identify contradictions
        
        Args:
            findings_by_source: {source_name: [findings]}
            
        Returns:
            List of contradictions flagged for review
        """
        contradictions = []
        
        # Simple logic: if one source says "rare" and another says "common", flag it
        # TODO: Implement more sophisticated comparison
        
        source_names = list(findings_by_source.keys())
        for i, source1 in enumerate(source_names):
            for source2 in source_names[i+1:]:
                findings1 = findings_by_source[source1]
                findings2 = findings_by_source[source2]
                
                for f1 in findings1:
                    for f2 in findings2:
                        if (f1.adverse_reaction.lower() == f2.adverse_reaction.lower() and
                            f1.frequency and f2.frequency and
                            f1.frequency.lower() != f2.frequency.lower()):
                            
                            contradictions.append({
                                'finding': f1.adverse_reaction,
                                'source1': source1,
                                'frequency1': f1.frequency,
                                'source2': source2,
                                'frequency2': f2.frequency,
                                'status': 'pending_review'
                            })
        
        return contradictions

class EvidenceClassifier:
    """
    Classify the evidence level of findings
    RCT, observational, case report, review, etc.
    """
    
    @staticmethod
    def classify_evidence_level(text: str) -> str:
        """
        Classify evidence level from text
        
        Args:
            text: Article text
            
        Returns:
            Evidence level: "rct", "observational", "case_report", "review", "other"
        """
        text_lower = text.lower()
        
        # Simple keyword-based classification
        if 'randomized controlled trial' in text_lower or 'rct' in text_lower:
            return 'rct'
        elif 'case report' in text_lower or 'case series' in text_lower:
            return 'case_report'
        elif 'systematic review' in text_lower or 'meta-analysis' in text_lower:
            return 'review'
        elif 'cohort' in text_lower or 'observational' in text_lower:
            return 'observational'
        
        return 'other'

# Initialize extractors
try:
    ner_extractor = DrugNERExtractor()
except Exception as e:
    logger.error(f"Failed to initialize NER extractor: {e}")
    ner_extractor = None
