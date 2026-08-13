'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled, { keyframes } from "styled-components";
import colors from "@/lib/colors";
import { DashboardShell, Card } from "@/components/dashboard";

const TopHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const MentorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ChatAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(119, 59, 236, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.normalWhite};
  flex: none;
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

const SubStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${colors.muted};

  span.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2ed573;
  }
`;

/* Span Full Width of Main Container */
const FullChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  margin-top: 16px;
`;

const CareerBanner = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  margin-bottom: 24px;
  width: 100%;
  background: rgba(119, 59, 236, 0.12);

  @media (max-width: 860px) {
    padding: 14px 18px;
  }
`;

const BannerText = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
`;

const ViewProfileBtn = styled.button`
  padding: 10px 22px;
  border-radius: 10px;
  border: 1px solid rgba(119, 59, 236, 0.4);
  background: rgba(119, 59, 236, 0.25);
  color: #a77bf3;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(119, 59, 236, 0.4);
    color: ${colors.normalWhite};
  }
`;

const DateDivider = styled.div`
  text-align: center;
  font-size: 13px;
  color: ${colors.muted};
  margin: 0 0 28px;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  flex: 1;
`;

const MessageRow = styled.div<{ $isSender?: boolean }>`
  display: flex;
  justify-content: ${(p) => (p.$isSender ? "flex-end" : "flex-start")};
  gap: 12px;
  align-items: flex-start;
  width: 100%;
`;

const BubbleAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(119, 59, 236, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: ${colors.normalWhite};
  flex: none;
`;

const MessageBubble = styled.div<{ $isSender?: boolean }>`
  max-width: 480px; /* Capped to match WhatsApp / Figma layout width */
  padding: 16px 20px;
  border-radius: ${(p) =>
    p.$isSender ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};
  background: ${(p) =>
    p.$isSender ? colors.buttonPurple : "rgba(255, 255, 255, 0.08)"};
  color: ${colors.normalWhite};
  font-size: 14px;
  line-height: 1.6;

  @media (max-width: 860px) {
    max-width: 82%;
  }
`;

const TimeMeta = styled.div<{ $isSender?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 6px;
`;

/* Typing Indicator Styling */
const TypingBubble = styled(MessageBubble)`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.08);
  padding: 14px 20px;
  color: ${colors.muted};
  font-size: 13px;
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
`;

const DotGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${colors.buttonPurple};
    animation: ${pulse} 1.4s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

export default function MentorChatPage() {
  const router = useRouter();

  const [messages] = useState([
    {
      id: 1,
      sender: "user",
      text: "Hi Paul, I just took the career quiz and found out my strength leans towards Software Engineering. I'm really interested in becoming a Software Engineer and would love to learn from your experience",
      time: "10:09 AM",
    },
    {
      id: 2,
      sender: "mentor",
      text: "Hi David, I'm happy to help. What would you like to know?",
      time: "10:15 AM",
    },
    {
      id: 3,
      sender: "user",
      text: "What skills do you think are most important for someone just starting out in software engineering",
      time: "10:16 AM",
    },
  ]);

  return (
    <DashboardShell
      heading={
        <TopHeader>
          <MentorInfo>
            <ChatAvatar>PD</ChatAvatar>
            <HeaderText>
              <Name>Paul Dirisu</Name>
              <SubStatus>
                <span>Senior Software Engineer</span>
                <span className="dot" />
                <span style={{ color: "#2ed573" }}>Online</span>
              </SubStatus>
            </HeaderText>
          </MentorInfo>
        </TopHeader>
      }
      topRight={<div />} /* Clears default top profile avatar */
    >
      <FullChatContainer>
        <CareerBanner>
          <BannerText>Software Engineering</BannerText>
          <ViewProfileBtn onClick={() => router.push("/mentor-profile")}>
            View profile
          </ViewProfileBtn>
        </CareerBanner>

        <DateDivider>Today</DateDivider>

        <MessageList>
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <MessageRow key={msg.id} $isSender={isUser}>
                {!isUser && <BubbleAvatar>PD</BubbleAvatar>}
                <MessageBubble $isSender={isUser}>
                  {msg.text}
                  <TimeMeta $isSender={isUser}>
                    <span>{msg.time}</span>
                    {isUser && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M18 6L7 17l-5-5m17-2l-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </TimeMeta>
                </MessageBubble>
              </MessageRow>
            );
          })}

          {/* Typing Indicator */}
          <MessageRow $isSender={false}>
            <BubbleAvatar>PD</BubbleAvatar>
            <TypingBubble $isSender={false}>
              <span>Paul is typing...</span>
              <DotGroup>
                <span />
                <span />
                <span />
              </DotGroup>
            </TypingBubble>
          </MessageRow>
        </MessageList>
      </FullChatContainer>
    </DashboardShell>
  );
}